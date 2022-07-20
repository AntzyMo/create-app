import './command'

import execute from './execute'
import initOptions from './initOptions'
import type { presets } from './type'

const presetsMap: presets[] = [
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
  }
]

const result = await initOptions(presetsMap)
if (result) execute(result)

