import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project sites are served at <username>.github.io/<repo-name>/,
// not the domain root — every asset reference needs that prefix or it 404s
// (this is what was happening: the deployed page was blank because every
// JS/CSS/model request was missing "/Antariksh/"). Vercel doesn't need this
// (it serves from the root), so only set it for the gh-pages build.
// IMPORTANT: this must exactly match your repo name, case-sensitive. If you
// rename the repo, update this too.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Antariksh/' : '/',
  plugins: [react(), tailwindcss()],
})
