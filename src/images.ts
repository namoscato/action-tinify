import * as core from '@actions/core'
import * as mime from 'mime'
import Image from './image'

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png']

export default class Images implements Iterable<Image> {
  private readonly filenames = new Set<string>()
  private readonly images: Image[] = []

  addFile(filename: string): void {
    if (this.filenames.has(filename)) {
      return core.debug(`[${filename}] Skipping duplicate file`)
    }

    const mimeType = mime.getType(filename)

    if (null === mimeType) {
      return core.warning(`[${filename}] Skipping file with unknown mime type`)
    }

    if (-1 === SUPPORTED_MIME_TYPES.indexOf(mimeType)) {
      return core.info(
        `[${filename}] Skipping file with unsupported mime type ${mimeType}`
      )
    }

    core.info(`[${filename}] Adding ${mimeType} image`)

    this.filenames.add(filename)
    this.images.push(new Image(filename))
  }

  [Symbol.iterator](): IterableIterator<Image> {
    return this.images.values()
  }
}
