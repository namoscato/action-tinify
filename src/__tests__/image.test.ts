import Image from '../image'

let image: Image

beforeEach(() => {
  image = new Image('FILE')
})

test('getFilename', () => {
  expect(image.getFilename()).toEqual('FILE')
})
