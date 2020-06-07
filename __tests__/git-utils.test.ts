import {getCommitMessage} from '../src/git-utils'
import {Commit} from '../src/git'

describe('getCommitMessage', () => {
  test('defined message', () => {
    const message = getCommitMessage({message: 'MESSAGE'} as Commit)
    expect(message).toEqual('MESSAGE')
  })

  test('one file', () => {
    const message = getCommitMessage({
      files: ['FILE']
    } as any)
    expect(message).toEqual('Compress image')
  })

  test('multiple files', () => {
    const message = getCommitMessage({
      files: ['FILE1', 'FILE2']
    } as any)
    expect(message).toEqual('Compress images')
  })
})
