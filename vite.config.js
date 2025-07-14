import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {

    assetsInlineLimit: 1024 * 1024, // 1MB limit for inlining assets

    chunkSizeWarningLimit: 2000, // Increase the chunk size warning limit (in KB)

    rollupOptions: {

      output: {

        manualChunks(id) {

          // Example: Separate large libs into their own chunks

          if (id.includes('node_modules')) {

            if (id.includes('react')) return 'react';

            if (id.includes('chart.js')) return 'chartjs';

            return 'vendor';

          }

        }

      }

    }

  }
})
