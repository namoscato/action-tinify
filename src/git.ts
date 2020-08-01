import {info} from '@actions/core'
import {exec} from '@actions/exec'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {EventNames, EventPayloads} from '@octokit/webhooks'
import Image from './image'
import {getCommitMessage} from './git-utils'
import {Endpoints} from '@octokit/types'
import PushEvent = EventNames.PushEvent
import PullRequestEvent = EventNames.PullRequestEvent
import WebhookPayloadPush = EventPayloads.WebhookPayloadPush
import WebhookPayloadPullRequest = EventPayloads.WebhookPayloadPullRequest

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
  eventName: PushEvent
  payload: WebhookPayloadPush
}

interface ContextPullRequest extends ContextBase {
  eventName: PullRequestEvent
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

          info(`[${context.eventName}] Fetching files for commit ${ref}`)

          filesPromises.push(
            this.getCommitFiles({
              ...context.repo,
              ref
            })
          )
        }
        break
      case ContextEventName.PullRequest:
        info(
          `[${context.eventName}] Fetching files for pull request ${context.payload.number}`
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
        return assertUnsupportedEvent(context)
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

function assertUnsupportedEvent(context: Context): never {
  throw new Error(
    `Unsupported event ${
      context.eventName
    } (currently supported events include ${Object.values(
      ContextEventName
    ).join(', ')})`
  )
}
