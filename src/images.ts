import * as core from '@actions/core'
import * as mime from 'mime'

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png']

export default class Images {
  private images: Set<string>

  constructor() {
    this.images = new Set()
  }

  addFile(filename: string): void {
    if (this.images.has(filename)) {
      return core.debug(`[${filename}] Skipping duplicate file`)
    }

    const mimeType = mime.getType(filename)

    if (null === mimeType) {
      return core.debug(`[${filename}] Skipping file with unknown mime type`)
    }

    if (-1 === SUPPORTED_MIME_TYPES.indexOf(mimeType)) {
      return core.debug(
        `[${filename}] Skipping file with unsupported mime type ${mimeType}`
      )
    }

    core.debug(`[${filename}] Adding ${mimeType} image`)

    this.images.add(filename)
  }

  all(): IterableIterator<string> {
    return this.images.values()
  }
}
