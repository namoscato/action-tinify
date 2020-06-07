import * as core from '@actions/core'
import {Context, ContextEventName, File} from './types/github'
import {GitHub} from '@actions/github/lib/utils'

export default class Git {
  constructor(private readonly octokit: InstanceType<typeof GitHub>) {}

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
