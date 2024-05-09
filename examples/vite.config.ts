import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/midikit",
  resolve: {
    alias: {
      "@": path.join(import.meta.dirname, "src"),
    },
  },
})
