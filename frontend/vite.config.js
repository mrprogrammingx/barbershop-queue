import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/queue': 'http://localhost:8002',
      '/admin': 'http://localhost:8002',
      '/api': 'http://localhost:8002',
    },
  },
})
