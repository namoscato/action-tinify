import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import Webhooks from '@octokit/webhooks'
import Image from './image'
import {getCommitMessage} from './git-utils'
import WebhookPayloadPush = Webhooks.WebhookPayloadPush
import WebhookPayloadPullRequest = Webhooks.WebhookPayloadPullRequest

export interface File {
  filename: string
  status: string
}

//region context
export enum ContextEventName {
  Push = 'push',
  PullRequest = 'pull_request'
}

type ContextBase = typeof github.context

interface ContextPush extends ContextBase {
  eventName: ContextEventName.Push
  payload: WebhookPayloadPush
}

interface ContextPullRequest extends ContextBase {
  eventName: ContextEventName.PullRequest
  payload: WebhookPayloadPullRequest
}

export type Context = ContextPush | ContextPullRequest
//endregion

export interface Commit {
  files: Image[]
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
    const filesPromises: Promise<File[]>[] = []

    switch (context.eventName) {
      case ContextEventName.Push:
        for (const commit of context.payload.commits) {
          const ref = commit.id

          core.info(`[${context.eventName}] Fetching files for commit ${ref}`)

          filesPromises.push(
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
        core.info(
          `[${context.eventName}] Fetching files for pull request ${context.payload.number}`
        )

        filesPromises.push(
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

    return Promise.all(filesPromises).then(files => {
      return files.reduce((result, value) => {
        result.push(
          ...value.filter(
            file => -1 !== ['added', 'modified'].indexOf(file.status)
          )
        )

        return result
      }, [])
    })
  }

  async commit(commit: Commit): Promise<void> {
    core.info('Adding modified images')
    await exec.exec('git', [
      'add',
      ...commit.files.map(image => image.getFilename())
    ])

    core.info('Configuring git')
    await exec.exec('git', ['config', 'user.name', commit.userName])
    await exec.exec('git', ['config', 'user.email', commit.userEmail])

    core.info('Create commit')
    await exec.exec('git', [
      'commit',
      `--message=${getCommitMessage(commit)}`,
      `--message=${commit.files
        .map(
          image => `* [${image.getFilename()}] ${image.getCompressionSummary()}`
        )
        .join('\n')}`
    ])

    core.info('Push commit')
    await exec.exec('git', ['push', 'origin'])
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
