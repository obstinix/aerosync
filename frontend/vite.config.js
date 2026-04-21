import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['aerosync-td50.onrender.com', 'all']
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
