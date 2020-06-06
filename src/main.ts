import * as core from '@actions/core'
import * as github from '@actions/github'
import {Context, ContextEventName, File} from 'github'

async function run(): Promise<void> {
  try {
    // const apiKey = core.getInput('api_key', {required: true})
    const githubToken = core.getInput('github_token', {required: true})
    const octokit = github.getOctokit(githubToken)

    const context = github.context as Context
    const filePromises: Promise<File[]>[] = []

    switch (context.eventName) {
      case ContextEventName.Push:
        for (const commit of context.payload.commits) {
          const ref = commit.id

          core.debug(`Fetching files for commit ${ref}`)

          filePromises.push(
            octokit.repos
              .getCommit({
                ...github.context.repo,
                ref
              })
              .then(response => response.data.files)
          )
        }
        break
      case ContextEventName.PullRequest:
        core.debug(`Fetching files for pull request ${context.payload.number}`)

        filePromises.push(
          octokit.paginate('GET /repos/:owner/:repo/pulls/:pull_number/files', {
            ...github.context.repo,
            pull_number: context.payload.number // eslint-disable-line @typescript-eslint/camelcase
          })
        )
        break
      default:
        assertUnsupportedEvent(context)
    }

    const filenames = new Set<string>()

    for (const files of await Promise.all(filePromises)) {
      for (const file of files) {
        filenames.add(file.filename)
      }
    }

    core.debug(`filenames: \n${Array.from(filenames.values()).join('\n')}`)
  } catch (error) {
    core.debug(error)
    core.setFailed(error.message)
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

run()
