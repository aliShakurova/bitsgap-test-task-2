import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths";
import {resolve} from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
  ],
  resolve: {
    alias: {
      '@assets': resolve(__dirname, "assets"),
    }
  },
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
})
