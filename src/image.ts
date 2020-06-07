import * as core from '@actions/core'
import * as fs from 'fs'
import Source from 'tinify/lib/tinify/Source'
import tinify from 'tinify'
import bytes from 'bytes'
import ExifReader from 'exifreader'
import xattr from 'fs-xattr'

export default class Image {
  private source?: Source

  constructor(private readonly filename: string) {}

  async compress(): Promise<void> {
    this.logInfo('Before')

    // this.source = tinify.fromFile(this.filename)
    //
    // return this.source.toFile(this.filename).then(() => {
    //   this.logInfo('After')
    // })
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
