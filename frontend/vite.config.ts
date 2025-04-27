import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// No longer need sveltePreprocess import here if using svelte.config.js

// https://vitejs.dev/config/
export default defineConfig({
  // Rely on svelte.config.js for preprocess configuration
  plugins: [svelte()],
  server: {
    host: '0.0.0.0', // Allow connections from Docker network
    port: 5173,      // Default Vite port
    strictPort: true, // Ensure this port is used
    allowedHosts: ["accorda.kolvian.com"],
    hmr: {
        clientPort: 5173 // Ensure HMR connects correctly through Docker mapping
    },
    watch: {
      usePolling: true // Needed for Docker volume mounting
    },
    proxy: {
      // Proxy /api requests to the backend service
      '/api': {
        target: 'http://backend:8000', // Service name in docker-compose
        changeOrigin: true,
        secure: false, // Allow proxying to http
      }
    }
  }
}) 