import { sveltekit } from '@sveltejs/kit/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		AutoImport({
			imports: [
				{
					'webextension-polyfill': [['*', 'browser']]
				}
			],
			dts: 'src/@types/auto-imports.d.ts'
		}),
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
