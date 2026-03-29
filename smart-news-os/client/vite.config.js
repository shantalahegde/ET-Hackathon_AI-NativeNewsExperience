import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/news': 'http://localhost:5000',
      '/chat': 'http://localhost:5000',
      '/video': 'http://localhost:5000',
      '/translate': 'http://localhost:5000',
    }
  }
})
