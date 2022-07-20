import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
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
})
