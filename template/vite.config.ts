import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sidebarConfig } from "../config.js";

const htmlPlugin = () => {
  return {
    name: "html-transform",
    transformIndexHtml(html) {
      return html.replace(
        /<title>(.*?)<\/title>/,
        `<title>${sidebarConfig.title}</title>`
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlPlugin()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: "../build",
    emptyOutDir: true,
  },
  publicDir: "../public",
});
