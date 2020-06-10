import * as core from '@actions/core'
import * as fs from 'fs'
import tinify from 'tinify'
import bytes from 'bytes'

export interface Compress {
  resizeWidth?: number
  resizeHeight?: number
}

/**
 * @see https://tinypng.com/developers/reference/nodejs#resizing-images
 */
export enum ResizeMethod {
  /** Scales the image down proportionally. */
  Scale = 'scale',
  /** Scales the image down proportionally so that it fits within the given dimensions. */
  Fit = 'fit'
}

export default class Image {
  constructor(
    private readonly filename: string,
    private sizes: number[] = []
  ) {}

  async compress(compress: Compress = {}): Promise<void> {
    this.setSize()

    core.info(`[${this.filename}] Compressing image`)

    let source = tinify.fromFile(this.filename)

    const width = compress.resizeWidth
    const height = compress.resizeHeight

    if (width || height) {
      core.info(`[${this.filename}] Resizing image (${width} x ${height})`)

      source = source.resize({
        method: width && height ? ResizeMethod.Fit : ResizeMethod.Scale,
        width,
        height
      })
    }

    await source.toFile(this.filename)

    this.setSize()
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
