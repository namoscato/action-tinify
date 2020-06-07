import Image from '../src/image'

let image: Image

beforeEach(() => {
  image = new Image('FILE', [20000, 9876])
})

test('getFilename', () => {
  expect(image.getFilename()).toEqual('FILE')
})

test('getCompressionSummary', () => {
  expect(image.getCompressionSummary()).toEqual('-9.89KB (-50%)')
})
