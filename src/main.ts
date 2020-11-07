import {debug, endGroup, getInput, setFailed, startGroup} from '@actions/core'
import {context} from '@actions/github'
import tinify from 'tinify'
import Images from './images'
import Git from './git'

async function run(): Promise<void> {
  try {
    tinify.key = getInput('api_key', {required: true})
    const git = new Git(getInput('github_token', {required: true}))

    startGroup('Collecting affected images')
    const files = await git.getFiles(context)
    const images = new Images()

    for (const file of files) {
      images.addFile(file.filename)
    }
    endGroup()

    startGroup('Compressing images')
    const compressedImages = []
    const resizeWidth = Number(getInput('resize_width')) || undefined
    const resizeHeight = Number(getInput('resize_height')) || undefined

    for (const image of images) {
      const compressed = await image.compress({
        resizeWidth,
        resizeHeight
      })

      if (compressed) {
        compressedImages.push(image)
      }
    }
    endGroup()

    if (compressedImages.length) {
      startGroup('Committing changes')
      await git.commit({
        files: compressedImages,
        userName: getInput('commit_user_name'),
        userEmail: getInput('commit_user_email'),
        message: getInput('commit_message')
      })
      endGroup()
    }
  } catch (error) {
    setFailed(error.message)
    debug(error.stack)
  }
}

run()
