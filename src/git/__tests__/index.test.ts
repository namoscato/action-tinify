import {Context} from '@actions/github/lib/context'
import nock, {Scope} from 'nock'
import Git from '..'

describe('Git', () => {
  let scope: Scope

  beforeEach(() => {
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
        const files = await new Git({
          token: 'TOKEN',
          context: ({
            eventName: 'push',
            payload: {
              commits: [{id: 'C1'}, {id: 'C2'}]
            },
            repo: {
              owner: 'OWNER',
              repo: 'REPO'
            }
          } as unknown) as Context
        }).getFiles()

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

    describe('pull_request', () => {
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
        const files = await new Git({
          token: 'TOKEN',
          context: ({
            eventName: 'pull_request',
            payload: {
              number: 1
            },
            repo: {
              owner: 'OWNER',
              repo: 'REPO'
            }
          } as unknown) as Context
        }).getFiles()

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
