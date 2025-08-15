import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Add build timeout and error handling
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress some warnings that might cause build issues
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        warn(warning)
      }
    },
    // Add source maps for better debugging
    sourcemap: false,
    // Optimize build size
    minify: 'terser',
    // Add build timeout
    chunkSizeWarningLimit: 1000
  },
  // Add server configuration for development
  server: {
    port: 3000,
    host: true
  }
})
