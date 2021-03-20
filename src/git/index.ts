import {info} from '@actions/core'
import {exec} from '@actions/exec'
import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {Endpoints} from '@octokit/types'
import {assertUnsupportedEvent, getCommitMessage} from './functions'
import {Commit, File, SupportedEvent} from './types'

export default class Git {
  private octokit: InstanceType<typeof GitHub>

  constructor(readonly token: string) {
    this.octokit = github.getOctokit(token)
  }

  async getFiles(context: Context): Promise<File[]> {
    const filesPromises: Promise<File[]>[] = []
    const eventName = context.eventName as SupportedEvent

    switch (eventName) {
      case 'push':
        for (const commit of context.payload.commits) {
          const ref = commit.id

          info(`[${eventName}] Fetching files for commit ${ref}`)

          filesPromises.push(
            this.getCommitFiles({
              ...context.repo,
              ref
            })
          )
        }
        break
      case 'pull_request':
      case 'pull_request_target':
        info(
          `[${eventName}] Fetching files for pull request ${context.payload.number}`
        )

        filesPromises.push(
          this.octokit.paginate(
            'GET /repos/:owner/:repo/pulls/:pull_number/files',
            {
              ...context.repo,
              pull_number: context.payload.number
            }
          )
        )
        break
      default:
        assertUnsupportedEvent(eventName)
    }

    const files = await Promise.all(filesPromises)

    return files.reduce((result, value) => {
      result.push(
        ...value.filter(
          file => -1 !== ['added', 'modified'].indexOf(file.status)
        )
      )

      return result
    }, [])
  }

  async commit(commit: Commit): Promise<void> {
    info('Adding modified images')
    await exec('git', [
      'add',
      ...commit.files.map(image => image.getFilename())
    ])

    info('Configuring git')
    await exec('git', ['config', 'user.name', commit.userName])
    await exec('git', ['config', 'user.email', commit.userEmail])

    info('Create commit')
    await exec('git', [
      'commit',
      `--message=${getCommitMessage(commit)}`,
      `--message=${commit.files
        .map(
          image => `* [${image.getFilename()}] ${image.getCompressionSummary()}`
        )
        .join('\n')}`
    ])

    info('Push commit')
    await exec('git', ['push', 'origin'])
  }

  private async getCommitFiles(
    params: Endpoints['GET /repos/:owner/:repo/commits/:ref']['parameters']
  ): Promise<File[]> {
    const response = await this.octokit.repos.getCommit(params)

    return response.data.files
  }
}
