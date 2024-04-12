/// <reference types="vitest" />
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import webExtension from "vite-plugin-web-extension";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isTest = mode === "test";

  return {
    plugins: [tsconfigPaths(), svelte(), webExtension()],
    resolve: {
      conditions: isTest ? ["browser"] : [],
    },
    test: {
      clearMocks: true,
      coverage: {
        exclude: ["svelte.config.js"],
      },
      environment: "happy-dom",
      globals: true,
      setupFiles: ["tests/setup.ts"],
    },
  };
});
