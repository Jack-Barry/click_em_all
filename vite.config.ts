import { resolve } from "node:path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "pages/popup.html"),
        options: resolve(__dirname, "pages/options.html"),
      },
    },
  },
});
