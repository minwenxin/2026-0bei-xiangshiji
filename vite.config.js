import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: { target: 'chrome129' },
  server: { port: 5173, strictPort: true },
  preview: { port: 4318, strictPort: true },
})
