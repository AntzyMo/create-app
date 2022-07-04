
import { green, bold } from 'kolorist'
import { removeSync, ensureDirSync, copySync } from 'fs-extra'
import { join, sep } from 'path'
import { fileURLToPath, URL } from 'url'

import type { result } from './type'
import { execaCommandSync } from 'execa'
import { chdir } from 'process'

const cwd = process.cwd() // 获取node进程的当前工作目录

type template ='typescript-react' |'typescript-vue'
const templatePath = (...dir:template[]) => fileURLToPath(new URL(`../template/${dir}`, import.meta.url))

const execute = (options:result) => {
  const { projectName, pickPresets, hasProjectDir } = options
  const root = join(cwd, projectName!)

  if (hasProjectDir) {
    removeSync(root)
  } else {
    ensureDirSync(root)
  }

  if (pickPresets === 'react') {
    copySync(templatePath('typescript-react'), root)
  }
  if (pickPresets === 'vue') {
    copySync(templatePath('typescript-vue'), root)
  }

  handleProcess(root)
}

const handleProcess = async (root:string) => {
  const projectName = root.split(sep).at(-1)
  // TODO
  // const prefixSep = (command:string) => `${sep}${command}`

  await cd(root)
  execaCommandSync('git init')
  console.log(`\n\n  ${bold(green(`进入${projectName}目录啦，正在安装依赖，请稍等...`))}\n\n`)

  execaCommandSync('pnpm i', { stdout: 'inherit' })
}

const cd = async (path:string) => {
  try {
    await chdir(path)
    console.log(`New directory: ${process.cwd()}`)
  } catch (err) {
    console.log(err, 'cderr')
  }
}

export default execute
