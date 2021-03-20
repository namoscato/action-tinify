import {info} from '@actions/core'
import {exec} from '@actions/exec'
import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {Endpoints} from '@octokit/types'
import {assertUnsupportedEvent, getCommitMessage} from './functions'
import {Commit, File, isPullRequestContext, SupportedContext} from './types'

interface Dependencies {
  readonly token: string
  readonly context: Context
}

export default class Git {
  private octokit: InstanceType<typeof GitHub>
  private context: SupportedContext

  constructor({token, context}: Dependencies) {
    this.octokit = github.getOctokit(token)
    this.context = context as SupportedContext
  }

  async getFiles(): Promise<File[]> {
    const filesPromises: Promise<File[]>[] = []

    switch (this.context.eventName) {
      case 'push':
        for (const commit of this.context.payload.commits) {
          const ref = commit.id

          info(`[${this.context.eventName}] Fetching files for commit ${ref}`)
          filesPromises.push(
            this.getCommitFiles({
              ...this.context.repo,
              ref
            })
          )
        }
        break
      case 'pull_request':
      case 'pull_request_target':
        info(
          `[${this.context.eventName}] Fetching files for pull request ${this.context.payload.number}`
        )

        filesPromises.push(
          this.octokit.paginate(
            'GET /repos/:owner/:repo/pulls/:pull_number/files',
            {
              ...this.context.repo,
              pull_number: this.context.payload.number
            }
          )
        )
        break
      default:
        assertUnsupportedEvent(this.context)
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
    let remote = 'origin'

    if (isPullRequestContext(this.context)) {
      remote = this.context.payload.pull_request.head.repo.git_url

      info('Detecting detached state')
      if (await this.isDetached()) {
        info('Checking out branch from detached state')
        await exec('git', [
          'checkout',
          '-b',
          this.context.payload.pull_request.head.ref
        ])
      }
    }

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
    await exec('git', ['push', remote])
  }

  private async getCommitFiles(
    params: Endpoints['GET /repos/:owner/:repo/commits/:ref']['parameters']
  ): Promise<File[]> {
    const response = await this.octokit.repos.getCommit(params)

    return response.data.files
  }

  /** @see https://stackoverflow.com/a/52222248 */
  private async isDetached(): Promise<boolean> {
    try {
      return Boolean(await exec('git', ['symbolic-ref', '--quiet', 'HEAD']))
    } catch (e) {
      return true
    }
  }
}
