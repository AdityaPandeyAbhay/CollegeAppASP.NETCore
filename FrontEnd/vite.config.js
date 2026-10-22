import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://collegeapp-api.runasp.net',
        changeOrigin: true,
      },
      '/Notices': {
        target: 'http://collegeapp-api.runasp.net',
        changeOrigin: true,
      },
      '/Results': {
        target: 'http://collegeapp-api.runasp.net',
        changeOrigin: true,
      },
    },
  },
})
