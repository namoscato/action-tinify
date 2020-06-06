import * as core from '@actions/core'
import * as fs from 'fs'
import {ExifData, ExifImage} from 'exif'
import Source from 'tinify/lib/tinify/Source'
import tinify from 'tinify'
import bytes from 'bytes'

export default class Image {
  private source?: Source

  constructor(private readonly filename: string) {}

  async compress(): Promise<void> {
    await this.logInfo('Before')

    this.source = tinify.fromFile(this.filename)

    return this.source
      .toFile(this.filename)
      .then(async () => this.logInfo('After'))
  }

  getFilename(): string {
    return this.filename
  }

  private async getExif(): Promise<ExifData> {
    return new Promise((resolve, reject) => {
      new ExifImage({image: this.filename}, function(error, exifData) {
        if (error) {
          reject(error)
        } else {
          resolve(exifData)
        }
      })
    })
  }

  private getSize(): number {
    return fs.statSync(this.filename).size
  }

  private async logInfo(message: string): Promise<void> {
    return this.getExif().then(exifData => {
      const size = bytes.format(this.getSize())
      const exif = JSON.stringify(exifData, null, 4)

      core.debug(`[${this.filename}] ${message}: ${size}\n${exif}`)
    })
  }
}
