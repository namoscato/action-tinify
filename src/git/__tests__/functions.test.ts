import {describe, expect, test} from '@jest/globals'
import Image from '../../image'
import {getCommitMessage} from '../functions'
import {Commit} from '../types'

describe('getCommitMessage', () => {
  test('defined message', () => {
    const message = getCommitMessage({message: 'MESSAGE'} as Commit)
    expect(message).toEqual('MESSAGE')
  })

  test('one file', () => {
    const message = getCommitMessage({
      files: [new Image('FILE')]
    } as Commit)
    expect(message).toEqual('Compress image')
  })

  test('multiple files', () => {
    const message = getCommitMessage({
      files: [new Image('FILE1'), new Image('FILE2')]
    } as Commit)
    expect(message).toEqual('Compress images')
  })
})
