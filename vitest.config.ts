// vitest.config.ts
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  plugins: [svelte(), WxtVitest()],
  resolve: {
    // fix svelte lifecycle methods: https://github.com/testing-library/svelte-testing-library/issues/222#issuecomment-1909993331
    conditions: ['browser']
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: [
        '**/*.d.ts',
        '.output/*',
        'demo/*',
        'dist/*',
        'tests/*',
        'src/entrypoints/*',
        'src/lib/types.ts',
        'vitest.config.ts',
        'wxt.config.ts'
      ]
    },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['tests/setup.ts']
  }
})
