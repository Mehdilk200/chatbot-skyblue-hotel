import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:2330', changeOrigin: true },
      '/hotel': { target: 'http://localhost:2330', changeOrigin: true },
      '/conversations': { target: 'http://localhost:2330', changeOrigin: true },
      '/reservations': { target: 'http://localhost:2330', changeOrigin: true },
      '/admin': { target: 'http://localhost:2330', changeOrigin: true },
      '/complaints': { target: 'http://localhost:2330', changeOrigin: true },
      '/services': { target: 'http://localhost:2330', changeOrigin: true },
      '/uploads': { target: 'http://localhost:2330', changeOrigin: true },
    }
  }
})
