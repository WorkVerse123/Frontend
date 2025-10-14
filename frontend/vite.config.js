import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev server proxy: forward any /api requests to the backend to avoid CORS
  // and prevent the frontend dev server (default :5173) from answering API calls.
  // Update the target if your backend runs on a different port or host.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5263',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
