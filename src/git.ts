import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import {Context, ContextEventName, File} from './types/github'
import {GitHub} from '@actions/github/lib/utils'

export interface Commit {
  branch?: string
  files: string[]
  userName: string
  userEmail: string
  message: string
}

export default class Git {
  private octokit: InstanceType<typeof GitHub>

  constructor(readonly token: string) {
    this.octokit = github.getOctokit(token)
  }

  async getFiles(context: Context): Promise<File[]> {
    const filePromises: Promise<File[]>[] = []

    switch (context.eventName) {
      case ContextEventName.Push:
        for (const commit of context.payload.commits) {
          const ref = commit.id

          core.debug(`[${context.eventName}] Fetching files for commit ${ref}`)

          filePromises.push(
            this.octokit.repos
              .getCommit({
                ...context.repo,
                ref
              })
              .then(response => response.data.files)
          )
        }
        break
      case ContextEventName.PullRequest:
        core.debug(
          `[${context.eventName}] Fetching files for pull request ${context.payload.number}`
        )

        filePromises.push(
          this.octokit.paginate(
            'GET /repos/:owner/:repo/pulls/:pull_number/files',
            {
              ...context.repo,
              pull_number: context.payload.number // eslint-disable-line @typescript-eslint/camelcase
            }
          )
        )
        break
      default:
        assertUnsupportedEvent(context)
    }

    return Promise.all(filePromises).then(files => {
      return files.reduce((result, value) => {
        result.push(...value)

        return result
      }, [])
    })
  }

  async commit(commit: Commit): Promise<void> {
    if (commit.branch) {
      await exec.exec('git', ['checkout', commit.branch])
    }

    await exec.exec('git', ['add', ...commit.files])

    await exec.exec('git', [
      `-c user.name="${commit.userName}"`,
      `-c user.email="${commit.userEmail}"`,
      'commit',
      `-m ${Git.getCommitMessage(commit)}`
    ])

    await exec.exec('git', ['push', 'origin'])
  }

  private static getCommitMessage(commit: Commit): string {
    let message = commit.message

    if (message) {
      return message
    }

    message = 'Compress image'

    if (commit.files.length > 1) {
      message += 's'
    }

    return message
  }
}

function assertUnsupportedEvent(context: Context): never {
  throw new Error(
    `Unsupported event ${
      context.eventName
    } (currently supported events include ${Object.values(
      ContextEventName
    ).join(', ')})`
  )
}
