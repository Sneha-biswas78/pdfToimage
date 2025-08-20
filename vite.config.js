import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base should be "/" for Vercel root deploys
export default defineConfig({
  plugins: [react()],
  base: '/',
})
