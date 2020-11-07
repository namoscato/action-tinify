import Git, {ContextEventName} from '../src/git'
import nock, {Scope} from 'nock'
import {Context} from '@actions/github/lib/context'

describe('Git', () => {
  let target: Git
  let scope: Scope

  beforeEach(() => {
    target = new Git('TOKEN')

    scope = nock(/api\.github\.com/)
  })

  describe('getFiles', () => {
    describe('push', () => {
      beforeEach(() => {
        scope.get('/repos/OWNER/REPO/commits/C1').reply(200, {
          files: [
            {
              id: 1,
              status: 'added'
            },
            {
              id: 2,
              status: 'removed'
            }
          ]
        })

        scope.get('/repos/OWNER/REPO/commits/C2').reply(200, {
          files: [
            {
              id: 3,
              status: 'modified'
            }
          ]
        })
      })

      test('should fetch files', async () => {
        const files = await target.getFiles(({
          eventName: ContextEventName.Push,
          payload: {
            commits: [{id: 'C1'}, {id: 'C2'}]
          },
          repo: {
            owner: 'OWNER',
            repo: 'REPO'
          }
        } as unknown) as Context)

        expect(files).toEqual([
          {
            id: 1,
            status: 'added'
          },
          {
            id: 3,
            status: 'modified'
          }
        ])

        expect(scope.isDone()).toBe(true)
      })
    })

    describe('pull request', () => {
      beforeEach(() => {
        scope.get('/repos/OWNER/REPO/pulls/1/files').reply(200, [
          {
            id: 1,
            status: 'added'
          },
          {
            id: 2,
            status: 'removed'
          },
          {
            id: 3,
            status: 'modified'
          }
        ])
      })

      test('should fetch files', async () => {
        const files = await target.getFiles(({
          eventName: ContextEventName.PullRequest,
          payload: {
            number: 1
          },
          repo: {
            owner: 'OWNER',
            repo: 'REPO'
          }
        } as unknown) as Context)

        expect(files).toEqual([
          {
            id: 1,
            status: 'added'
          },
          {
            id: 3,
            status: 'modified'
          }
        ])

        expect(scope.isDone()).toBe(true)
      })
    })
  })
})
