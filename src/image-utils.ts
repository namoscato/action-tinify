import {Compress} from './image'
import {ISizeCalculationResult} from 'image-size/dist/types/interface'
import bytes from 'bytes'

/**
 * @see https://tinypng.com/developers/reference/nodejs#resizing-images
 */
export enum ResizeMethod {
  /** Scales the image down proportionally. */
  Scale = 'scale',
  /** Scales the image down proportionally so that it fits within the given dimensions. */
  Fit = 'fit'
}

export function getCompressionSummary(sizes: number[]): string {
  const before = sizes[0]
  const after = sizes[1]

  return `${bytes.format(after - before)} (-${Math.floor(
    100 * (1 - after / before)
  )}%)`
}

export function getResizeOptions(compress: Compress): object {
  const width = compress.resizeWidth
  const height = compress.resizeHeight

  return {
    method: width && height ? ResizeMethod.Fit : ResizeMethod.Scale,
    width,
    height
  }
}

export function isResizable(
  {resizeWidth, resizeHeight}: Compress,
  dimensions: Partial<ISizeCalculationResult> = {}
): boolean {
  const {width, height} = dimensions

  return isSmaller(resizeWidth, width) || isSmaller(resizeHeight, height)
}

function isSmaller(resize?: number, dimension?: number): boolean {
  return Boolean(resize && (!dimension || resize < dimension))
}
