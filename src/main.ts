import * as core from '@actions/core'
import * as github from '@actions/github'
import tinify from 'tinify'
import Images from './images'
import Git, {Context} from './git'

async function run(): Promise<void> {
  try {
    tinify.key = core.getInput('api_key', {required: true})
    const git = new Git(core.getInput('github_token', {required: true}))

    const files = await git.getFiles(github.context as Context)
    const images = new Images()

    for (const file of files) {
      images.addFile(file.filename)
    }

    const compressedImages = []

    for (const image of images) {
      if (await image.compress()) {
        compressedImages.push(image.getFilename())
      }
    }

    if (compressedImages.length) {
      git
        .commit({
          files: compressedImages,
          userName: core.getInput('commit_user_name'),
          userEmail: core.getInput('commit_user_email'),
          message: core.getInput('commit_message')
        })
        .catch(function(error) {
          throw error
        })
    }
  } catch (error) {
    core.setFailed(error.message)
    core.debug(error.stack)
  }
}

run()
