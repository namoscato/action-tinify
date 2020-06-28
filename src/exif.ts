import {exec, ExecOptions} from '@actions/exec'

export enum Tag {
  Software = 'Software'
}

export default class Exif {
  private static COMMAND = '/usr/bin/exiftool'

  constructor(private filename: string) {}

  async get(tag: Tag): Promise<string> {
    let output = ''

    const options: ExecOptions = {
      listeners: {
        stdout(data: Buffer) {
          output += data.toString()
        }
      }
    }

    await exec(Exif.COMMAND, [`-${tag}`, this.filename], options)

    return output
  }
}
