import './command'

import defineConfig from './defineConfig'

defineConfig({
  presets: [
    {
      title: 'vue3 (typescript eslint prettier)',
      value: 'vue'
    },
    {
      title: 'react (typescript eslint prettier husky)',
      value: 'react'
    },
    {
      title: 'pkg',
      value: 'pkg'
    },
    {
      title: 'vue官方脚手架',
      value: 'npm init vue@latest'
    }
  ]
})

