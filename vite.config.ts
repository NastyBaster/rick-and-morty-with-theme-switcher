import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/rick-and-morty-with-theme-switcher/',
  server: {
    proxy: {
      "/api": {
        target: "https://rickandmortyapi.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
