# Tinify Action

[GitHub Action](https://github.com/features/actions) to compress images with the [Tinify API](https://tinypng.com/developers).

![Example commit](https://i.imgur.com/FWOosON.png)

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
