import * as core from '@actions/core'
import {Magic} from 'mmmagic'

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png']

export default class Images {
  private images: Set<string>

  constructor(private magic: Magic) {
    this.images = new Set()
  }

  async addFile(filename: string): Promise<void> {
    if (this.images.has(filename)) {
      core.debug(`[${filename}] Skipping duplicate file`)

      return Promise.resolve()
    }

    const mimeType = await this.getMimeType(filename)

    if (-1 === SUPPORTED_MIME_TYPES.indexOf(mimeType)) {
      core.debug(
        `[${filename}] Skipping file with unsupported mime type ${mimeType}`
      )

      return Promise.resolve()
    }

    core.debug(`[${filename}] Adding ${mimeType} image`)

    this.images.add(filename)

    return Promise.resolve()
  }

  all(): IterableIterator<string> {
    return this.images.values()
  }

  private async getMimeType(filename: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.magic.detectFile(filename, function(error, result) {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}
