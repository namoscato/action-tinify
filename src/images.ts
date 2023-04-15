import {debug, info} from '@actions/core'
import {existsSync} from 'fs'
import {getType} from 'mime'
import Image from './image'

/** @see https://tinypng.com/developers/reference#compressing-images */
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default class Images implements Iterable<Image> {
  private readonly filenames = new Set<string>()
  private readonly images: Image[] = []

  addFile(filename: string): void {
    if (!existsSync(filename)) {
      return debug(`[${filename}] Skipping nonexistent file`)
    }

    if (this.filenames.has(filename)) {
      return debug(`[${filename}] Skipping duplicate file`)
    }

    const mimeType = getType(filename)

    if (null === mimeType) {
      return debug(`[${filename}] Skipping file with unknown mime type`)
    }

    if (-1 === SUPPORTED_MIME_TYPES.indexOf(mimeType)) {
      return debug(
        `[${filename}] Skipping file with unsupported mime type ${mimeType}`
      )
    }

    info(`[${filename}] Adding ${mimeType} image`)

    this.filenames.add(filename)
    this.images.push(new Image(filename))
  }

  [Symbol.iterator](): IterableIterator<Image> {
    return this.images.values()
  }
}
