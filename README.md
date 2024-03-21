# click-em-all

A cross-browser compatible extension for clicking all the things.

## Development Notes

This extension was built using [@samrum/vite-plugin-web-extension](https://github.com/samrum/vite-plugin-web-extension)

The extension manifest is defined in `src/manifest.ts` and used by `@samrum/vite-plugin-web-extension`
in the vite config.

Background, content scripts, options, and popup entry points exist in the `src/entries`
directory.

Content scripts are rendered by `src/entries/contentScript/renderContent.ts` which
renders content within a ShadowRoot and handles style injection for HMR and build
modes.

Otherwise, the project functions just like a regular Vite project.

To switch between Manifest V2 and Manifest V3 builds, set the `MANIFEST_VERSION`
environment variable to `2` or `3`.

HMR during development in Manifest V3 requires Chromium version >= 110.0.5480.0.

## Commands

### Build

#### Development, HMR

Hot Module Reloading is used to load changes inline without requiring extension rebuilds
and extension/page reloads
This currently only works in Chromium based browsers.

```sh
npm run dev
```

#### Development, Watch

Rebuilds extension on file changes. Requires a reload of the extension (and page
reload if using content scripts)

```sh
npm run watch
```

#### Production

Minifies and optimizes extension build

```sh
npm run build
```

### Load extension in browser

Loads the contents of the dist directory into the specified browser

```sh
npm run serve:chrome
```

```sh
npm run serve:firefox
```
