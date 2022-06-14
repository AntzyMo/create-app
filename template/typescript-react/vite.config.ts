import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import type { ConfigEnv } from 'vite'

import react from '@vitejs/plugin-react'

/* 生成依赖图 */
import { visualizer } from 'rollup-plugin-visualizer'

/* 生成打包分析包 */
const createVisualizer = (command: ConfigEnv['command']) => {
  if (command === 'build') {
    return visualizer({
      filename: 'visualizer.html',
      open: true,
      brotliSize: true
    })
  }
}

export default defineConfig(({ command }) => ({
  /* 可以删除 只是用来配置git pages */
  base: command === 'build' ? '/react-ant-template/' : '/',
  plugins: [react(), createVisualizer(command)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true // 支持内联css
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
        // manualChunks(id) {
        //   if (id.includes('node_modules')) { // 超大静态资源拆分
        //     return id.toString().split('node_modules/')[1].split('/')[0].toString()
        //   }
        // }
      }
    }
  }

  // server: {
  //   host: true,
  //   proxy: {
  //     "/api": {
  //       // target:'https://test.jobcn.com', // 测试
  //       target:'/mock', // 测试
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ""),
  //     },
  //   },
  // },
}))
