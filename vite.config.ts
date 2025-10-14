import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/groupevent/' for GitHub Pages, '/' for Vercel
  base: process.env.VERCEL ? '/' : '/groupevent/',
  build: {
    outDir: 'dist',
  },
})
