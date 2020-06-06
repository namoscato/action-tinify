import * as core from '@actions/core'
import * as github from '@actions/github'
import {Context, ContextEventName, File} from 'github'
import Images from 'images'

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

          core.debug(`[${context.eventName}] Fetching files for commit ${ref}`)

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
        core.debug(
          `[${context.eventName}] Fetching files for pull request ${context.payload.number}`
        )

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

    const images = new Images()

    for (const files of await Promise.all(filePromises)) {
      for (const file of files) {
        images.addFile(file.filename)
      }
    }

    core.debug(`filenames: \n${Array.from(images.all()).join('\n')}`)
  } catch (error) {
    core.debug(error.stack)
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
