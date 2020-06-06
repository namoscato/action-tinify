import * as core from '@actions/core'
import * as github from '@actions/github'
import {Context, ContextEventName} from 'github'

async function run(): Promise<void> {
  try {
    // const apiKey = core.getInput('api_key', {required: true})
    const githubToken = core.getInput('github_token', {required: true})

    const context = github.context as Context
    let commits: string[]

    switch (context.eventName) {
      case ContextEventName.Push:
        commits = context.payload.commits.map(commit => commit.id)
        break
      case ContextEventName.PullRequest:
        commits = await github
          .getOctokit(githubToken)
          .paginate('GET /repos/:owner/:repo/pulls/:pull_number/commits', {
            ...github.context.repo,
            pull_number: context.payload.number // eslint-disable-line @typescript-eslint/camelcase
          })
          .then(response => response.map(commit => commit.sha))
        break
      default:
        assertUnsupportedEvent(context)
    }

    core.debug(`commits: ${JSON.stringify(commits, null, 4)}`)
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
