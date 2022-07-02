import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import del from 'rollup-plugin-delete'

export default {
  input: 'core/index.ts',
  preserveEntrySignatures: false,
  output: {
    dir: 'dist',
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    del({ targets: 'dist/*' })
  ]
}
