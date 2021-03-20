import {Context} from '@actions/github/lib/context'
import {Commit, supportedEvents} from './types'

export function getCommitMessage(commit: Commit): string {
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

export function assertUnsupportedEvent(context: never): never {
  throw new Error(
    `Unsupported event ${
      (context as Context).eventName
    } (currently supported events include ${supportedEvents.join(', ')})`
  )
}
