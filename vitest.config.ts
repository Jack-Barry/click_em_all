import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import webExtension from '@samrum/vite-plugin-web-extension'
import path from 'path'
import { getManifest } from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      svelte(),
      webExtension({
        manifest: getManifest(Number(env.MANIFEST_VERSION))
      })
    ],
    resolve: {
      // fix svelte lifecycle methods: https://github.com/testing-library/svelte-testing-library/issues/222#issuecomment-1909993331
      conditions: mode === 'test' ? ['browser'] : [],
      alias: {
        '~': path.resolve(__dirname, './src')
      }
    },

    test: {
      clearMocks: true,
      coverage: {
        exclude: [
          '**/*.d.ts',
          'dist/*',
          'tests/*',
          'src/manifest.ts',
          'src/entries/**/App.svelte',
          'src/entries/**/{main,script,serviceWorker}.ts',
          'svelte.config.js',
          'vite.config.ts'
        ]
      },
      environment: 'happy-dom',
      globals: true,
      setupFiles: ['tests/setup.ts']
    }
  }
})
