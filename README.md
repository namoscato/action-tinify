# Tinify Image Action

[GitHub Action](https://github.com/features/actions) to compress and resize images with the [Tinify API](https://tinypng.com/developers).

![Example commit](https://i.imgur.com/FWOosON.png)

## Features

* filters PNG and JPEG files in a commit or pull request
* optionally scales images proportionally
* pushes commit with compression metrics

## Usage

```yaml
name: image
on:
  pull_request:
    types: [opened]
jobs:
  compress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          ref: ${{ github.head_ref }}
      - uses: namoscato/action-tinify@v1
        with:
          api_key: ${{ secrets.TINIFY_API_KEY }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| input | description |
| --- | --- |
| **`api_key`** | Tinify API key (create one [here](https://tinypng.com/developers)) |
| **`github_token`** | `GITHUB_TOKEN` secret |
| `commit_user_name` | Git user.name, defaults to `github.actor` |
| `commit_user_email` | Git user.email, defaults to `<github.actor>@users.noreply.github.com` |
| `commit_message` | Custom commit message, defaults to `Compress image(s)` |
| `resize_width` | Maximum target image width |
| `resize_height` | Maximum target image height |
