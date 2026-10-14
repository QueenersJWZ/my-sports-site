import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 根据环境自动判断 base 路径
const isVercel = process.env.VERCEL === '1'
const base = process.env.VITE_BASE ?? (isVercel ? '/' : '/my-sports-site/')

export default defineConfig({
  plugins: [react()],
  base: base,
})
