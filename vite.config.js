import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('@mui/x-date-pickers')
          ) {
            return 'mui-pickers'
          }

          if (
            id.includes('@mui/material') ||
            id.includes('@mui/system') ||
            id.includes('@emotion/')
          ) {
            return 'mui-core'
          }

          if (id.includes('react-router') || id.includes('@remix-run/router')) {
            return 'router-vendor'
          }

          if (id.includes('dayjs')) {
            return 'date-vendor'
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
