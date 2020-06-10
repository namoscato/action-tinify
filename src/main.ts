import * as core from '@actions/core'
import * as github from '@actions/github'
import tinify from 'tinify'
import Images from './images'
import Git, {Context} from './git'

async function run(): Promise<void> {
  try {
    tinify.key = core.getInput('api_key', {required: true})
    const git = new Git(core.getInput('github_token', {required: true}))

    core.startGroup('Collecting affected images')
    const files = await git.getFiles(github.context as Context)
    const images = new Images()

    for (const file of files) {
      images.addFile(file.filename)
    }
    core.endGroup()

    core.startGroup('Compressing images')
    const compressedImages = []
    const resizeWidth = Number(core.getInput('resize_width')) || undefined
    const resizeHeight = Number(core.getInput('resize_height')) || undefined

    for (const image of images) {
      await image.compress({
        resizeWidth,
        resizeHeight
      })

      compressedImages.push(image)
    }
    core.endGroup()

    if (compressedImages.length) {
      core.startGroup('Committing changes')
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
      core.endGroup()
    }
  } catch (error) {
    core.setFailed(error.message)
    core.debug(error.stack)
  }
}

run()
