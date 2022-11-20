[![ci](https://github.com/namoscato/action-tinify/actions/workflows/ci.yml/badge.svg)](https://github.com/namoscato/action-tinify/actions/workflows/ci.yml) [![docker](https://img.shields.io/docker/v/namoscato/github-action-tinify?label=docker&logoColor=%23fff&sort=semver)](https://hub.docker.com/r/namoscato/github-action-tinify)

# Tinify Image Action

[GitHub Action](https://github.com/features/actions) to compress and resize images with the [Tinify API](https://tinypng.com/developers).

![Example commit](https://i.imgur.com/FWOosON.png)

## Features

- filters PNG and JPEG files in a commit or pull request
- optionally scales images proportionally
- sets Exif metadata to prevent duplicate compressions
- pushes commit with compression metrics

## Usage

For example, on [`pull_request` events](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#onpushpull_requestpaths) with modified files inside the `static` directory:

```yaml
name: image
on:
  pull_request:
    paths:
      - 'static/**'
jobs:
  compress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}
      - uses: namoscato/action-tinify@v1
        with:
          api_key: ${{ secrets.TINIFY_API_KEY }}
```

### Events

The following [webhook events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#webhook-events) are supported:

- `pull_request`
- `push`

In pull request contexts, [`actions/checkout`](https://github.com/actions/checkout) checkouts a _merge_ commit by default. You must checkout the pull request _HEAD_ commit by overriding the `ref` input as illustrated above and as noted in [their documentation](https://github.com/actions/checkout#Checkout-pull-request-HEAD-commit-instead-of-merge-commit).

### Inputs

| input               | description                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`api_key`**       | Tinify API key (create one [here](https://tinypng.com/developers))                                                                                                         |
| `github_token`      | Repository `GITHUB_TOKEN` or personal access token secret; defaults to [`github.token`](https://docs.github.com/en/actions/security-guides/automatic-token-authentication) |
| `commit_user_name`  | Git user.name, defaults to `github.actor`                                                                                                                                  |
| `commit_user_email` | Git user.email, defaults to `<github.actor>@users.noreply.github.com`                                                                                                      |
| `commit_message`    | Custom commit message, defaults to `Compress image(s)`                                                                                                                     |
| `resize_width`      | Maximum target image width                                                                                                                                                 |
| `resize_height`     | Maximum target image height                                                                                                                                                |
