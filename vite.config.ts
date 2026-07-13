import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 400,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules\/(react|react-dom|scheduler)\//,
            },
            {
              name: 'vendor-router',
              test: /node_modules\/react-router(?:-dom)?\//,
            },
            {
              name: 'vendor-query',
              test: /node_modules\/@tanstack\/(react-query|query-core)\//,
            },
            {
              name: 'vendor-utils',
              test: /node_modules\/(axios|zustand)\//,
            },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
