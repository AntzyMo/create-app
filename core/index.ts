#!/usr/bin/env node

import execute from './execute'
import initOptions from './initOptions'

const init = async () => {
  const result = await initOptions()
  if (result) {
    execute(result)
  }
}

init()
