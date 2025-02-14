# ![Click 'em All Logo](./src/assets/logo.svg) Click 'em All

A cross-browser compatible extension for clicking all the things.

## Demo of Usage

<https://github.com/user-attachments/assets/7a4e0819-86ba-4609-8820-6f88cc8e8eab>

## Development Notes

This extension was built using the nifty [WXT](https://wxt.dev/) framework.

## Setup

```sh
npm ci
```

To build and run it locally in your browser:

```sh
npm run build
# or
npm run build:firefox
```

Output will be in `.output/chrome-mv3` or `.output/firefox-mv2`. Side load into
your browser and you're all set. Downside is that the storage will get wiped
when you close the browser (at least with Firefox) so you may want to save your
config in a separate JSON file.
