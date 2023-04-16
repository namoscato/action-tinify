import {exec, ExecOptions} from '@actions/exec'

export enum Tag {
  Software = 'Software',
  XMPToolkit = 'xmptoolkit'
}

export default class Exif {
  private static COMMAND = '/usr/local/bin/exiftool'

  constructor(private filename: string) {}

  async get(tags: Tag[] = []): Promise<string> {
    let output = ''

    const options: ExecOptions = {
      listeners: {
        stdout(data: Buffer) {
          output += data.toString()
        }
      }
    }

    await exec(
      Exif.COMMAND,
      ['-veryShort', '-tab', ...tags.map(tag => `-${tag}`), this.filename],
      options
    )

    return output
  }

  async set(inputs: [Tag, string][]): Promise<boolean> {
    return Boolean(
      await exec(Exif.COMMAND, [
        ...inputs.map(input => `-${input[0]}=${input[1]}`),
        this.filename
      ])
    )
  }
}
