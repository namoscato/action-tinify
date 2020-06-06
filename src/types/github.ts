import {context} from '@actions/github'
import Webhooks from '@octokit/webhooks'
import WebhookPayloadPush = Webhooks.WebhookPayloadPush
import WebhookPayloadPullRequest = Webhooks.WebhookPayloadPullRequest

export interface File {
  filename: string
}

export enum ContextEventName {
  Push = 'push',
  PullRequest = 'pull_request'
}

type ContextBase = typeof context

interface ContextPush extends ContextBase {
  eventName: ContextEventName.Push
  payload: WebhookPayloadPush
}

interface ContextPullRequest extends ContextBase {
  eventName: ContextEventName.PullRequest
  payload: WebhookPayloadPullRequest
}

export type Context = ContextPush | ContextPullRequest
