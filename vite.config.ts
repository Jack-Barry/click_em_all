/// <reference types="vitest" />
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [svelte(), webExtension()],
  resolve: {
    conditions: mode === "test" ? ["browser"] : [],
  },
  test: {
    clearMocks: true,
    environment: "happy-dom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
  },
}));
