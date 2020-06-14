import {info, debug} from '@actions/core'
import {statSync} from 'fs'
import tinify from 'tinify'
import bytes from 'bytes'
import {imageSize} from 'image-size'
import {promisify} from 'util'
import {
  getCompressionSummary,
  getResizeOptions,
  isResizable
} from './image-utils'

const sizeOf = promisify(imageSize)

export interface Compress {
  resizeWidth?: number
  resizeHeight?: number
}

export default class Image {
  private readonly sizes: number[] = []

  constructor(private readonly filename: string) {}

  async compress(compress: Compress = {}): Promise<void> {
    this.setSize()

    info(`[${this.filename}] Compressing image`)

    let source = tinify.fromFile(this.filename)

    debug(`[${this.filename}] Retrieving image size`)
    const dimensions = await sizeOf(this.filename)

    if (isResizable(compress, dimensions)) {
      info(`[${this.filename}] Resizing image`)
      source = source.resize(getResizeOptions(compress))
    }

    await source.toFile(this.filename)

    this.setSize()
  }

  getFilename(): string {
    return this.filename
  }

  getCompressionSummary(): string {
    return getCompressionSummary(this.sizes)
  }

  private setSize(): void {
    const size = statSync(this.filename).size

    this.sizes.push(size)

    debug(`[${this.filename}] ${bytes.format(size)}`)
  }
}
