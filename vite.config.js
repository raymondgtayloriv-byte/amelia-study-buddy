/* global process */
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// VITE_BASE is set to "/amelia-study-buddy/" by the GitHub Pages workflow.
// Local dev/build default to "/".
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
})
