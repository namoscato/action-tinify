import * as core from '@actions/core'
import * as fs from 'fs'
import Source from 'tinify/lib/tinify/Source'
import tinify from 'tinify'
import bytes from 'bytes'
import ExifReader from 'exifreader'
import xattr from 'fs-xattr'

/** extended file attribute name used to track state across workflow runs */
const ATTR_NAME = 'com.tinypng.optimized'

export default class Image {
  private source?: Source

  constructor(private readonly filename: string) {}

  async compress(): Promise<boolean> {
    try {
      xattr.getSync(this.filename, ATTR_NAME)

      core.debug(`[${this.filename}] Skipping already compressed image`)

      return false
    } catch (e) {
      this.logInfo('Before')

      core.info(`[${this.filename}] Compressing image`)

      await tinify.fromFile(this.filename).toFile(this.filename)
      xattr.setSync(this.filename, ATTR_NAME, '1')

      this.logInfo('After')

      return true
    }
  }

  getFilename(): string {
    return this.filename
  }

  private getSize(): number {
    return fs.statSync(this.filename).size
  }

  private logInfo(message: string): void {
    const info = [
      bytes.format(this.getSize()),
      JSON.stringify(ExifReader.load(fs.readFileSync(this.filename)), null, 4),
      JSON.stringify(xattr.listSync(this.filename))
    ]

    core.debug(`[${this.filename}] ${message}: ${info.join('\n')}`)
  }
}
