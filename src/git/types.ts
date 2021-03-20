import Image from '../image'

export const supportedEvents = [
  'push',
  'pull_request',
  'pull_request_target'
] as const

export type SupportedEvent = typeof supportedEvents[number]

export interface File {
  filename: string
  status: string
}

export interface Commit {
  files: Image[]
  userName: string
  userEmail: string
  message: string
}
