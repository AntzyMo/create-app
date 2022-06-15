import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import del from 'rollup-plugin-delete'
// import banner from 'rollup-plugin-banner'
import banner from 'rollup-plugin-add-banner'
export default {
  input: 'core/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    del({ targets: 'dist/*' }),
    banner({
      content: '#!/usr/bin/env node'
    })
  ]
}
