import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.ts',
  preserveEntrySignatures: false,
  output: {
    dir: 'dist',
    format: 'esm',
    banner: '#!/usr/bin/env node'
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    del({ targets: 'dist/*' }),
    json()
  ]
}
