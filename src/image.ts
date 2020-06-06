import * as core from '@actions/core'
import * as fs from 'fs'
import Source from 'tinify/lib/tinify/Source'
import tinify from 'tinify'
import bytes from 'bytes'

export default class Image {
  private source?: Source

  constructor(private filename: string) {}

  async compress(): Promise<void> {
    core.debug(`[${this.filename}] Before: ${bytes.format(this.getSize())}`)

    this.source = tinify.fromFile(this.filename)

    return this.source.toFile(this.filename).then(() => {
      core.debug(`[${this.filename}] After: ${bytes.format(this.getSize())}`)
    })
  }

  getFilename(): string {
    return this.filename
  }

  private getSize(): number {
    return fs.statSync(this.filename).size
  }
}
