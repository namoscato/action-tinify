import * as core from '@actions/core'
import * as github from '@actions/github'
import tinify from 'tinify'
import {Context} from './types/github'
import Images from './images'
import Git from './git'

async function run(): Promise<void> {
  try {
    tinify.key = core.getInput('api_key', {required: true})
    const git = new Git(
      github.getOctokit(core.getInput('github_token', {required: true}))
    )

    const files = await git.getFiles(github.context as Context)
    const images = new Images()

    for (const file of files) {
      images.addFile(file.filename)
    }

    for (const image of images) {
      core.info(`[${image.getFilename()}] Compressing image`)
      await image.compress()
    }
  } catch (error) {
    core.debug(error.stack)
    core.setFailed(error.message)
  }
}

run()
