import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/forge2-prashantHackathon/' : '/',
  plugins: [react()],
})
