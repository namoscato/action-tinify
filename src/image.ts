import * as core from '@actions/core'
import * as fs from 'fs'
import tinify from 'tinify'
import bytes from 'bytes'

export default class Image {
  private sizes: number[] = []

  constructor(private readonly filename: string) {}

  async compress(): Promise<boolean> {
    this.setSize()

    core.info(`[${this.filename}] Compressing image`)

    await tinify.fromFile(this.filename).toFile(this.filename)

    this.setSize()

    return true
  }

  getFilename(): string {
    return this.filename
  }

  getCompressionSummary(): string {
    const before = this.sizes[0]
    const after = this.sizes[1]

    return `${bytes.format(after - before)} (-${Math.floor(
      100 * (1 - after / before)
    )}%)`
  }

  private setSize(): void {
    const size = fs.statSync(this.filename).size

    this.sizes.push(size)

    core.debug(`[${this.filename}] ${bytes.format(size)}`)
  }
}
