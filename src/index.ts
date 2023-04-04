#!/usr/bin/env node

import './command'
import defineConfig from './defineConfig'

defineConfig({
  presets: [
    {
      title: 'pkg',
      value: 'pkg'
    }
  ]
})

