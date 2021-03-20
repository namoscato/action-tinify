import {
  getCompressionSummary,
  getResizeOptions,
  isResizable,
  ResizeMethod
} from '../image-utils'

test('getCompressionSummary', () => {
  expect(getCompressionSummary([20000, 9876])).toEqual('-9.89KB (-50%)')
})

describe('getResizeOptions', () => {
  test('width', () => {
    expect(getResizeOptions({resizeWidth: 10})).toEqual({
      method: ResizeMethod.Scale,
      width: 10
    })
  })

  test('height', () => {
    expect(getResizeOptions({resizeHeight: 10})).toEqual({
      method: ResizeMethod.Scale,
      height: 10
    })
  })

  test('width and height', () => {
    expect(getResizeOptions({resizeWidth: 10, resizeHeight: 10})).toEqual({
      method: ResizeMethod.Fit,
      width: 10,
      height: 10
    })
  })
})

describe('isResizable', () => {
  test('no resize', () => {
    expect(isResizable({}, {width: 10, height: 10})).toEqual(false)
  })

  describe('width', () => {
    test('no resize', () => {
      expect(isResizable({resizeWidth: 10}, {width: 10, height: 10})).toEqual(
        false
      )
    })

    test('resize', () => {
      expect(isResizable({resizeWidth: 10}, {width: 11, height: 10})).toEqual(
        true
      )
    })
  })

  describe('height', () => {
    test('no resize', () => {
      expect(isResizable({resizeHeight: 10}, {width: 10, height: 10})).toEqual(
        false
      )
    })

    test('resize', () => {
      expect(isResizable({resizeHeight: 10}, {width: 10, height: 11})).toEqual(
        true
      )
    })
  })
})
