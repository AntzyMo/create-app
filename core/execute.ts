
import { removeSync, ensureDirSync, copySync } from 'fs-extra'
import { join, resolve } from 'path'
import { result } from './type'
import { $, cd } from 'zx'
import { bold, green } from 'kolorist'

const cwd = process.cwd() // 获取node进程的当前工作目录

type template ='typescript-react' |'typescript-vue'
const templatePath = (...dir:template[]) => resolve(__dirname, '../template', ...dir)

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

  hadnleProcess(root)
}

const hadnleProcess = async (root:string) => {
  const projectName = root.split('/').at(-1)

  $.verbose = false
  await cd(`/${root}`)
  await $`git init`
  console.log(`  ${bold(green(`进入啦${projectName}目录，正在安装依赖，请稍等...`))}\n\n`)
  await $`pnpm i`
  console.log(`  ${bold(green('依赖安装完啦'))}\n`)
}

export default execute
