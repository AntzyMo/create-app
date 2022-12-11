
import { execaCommandSync } from 'execa'
import { copySync, ensureDirSync, removeSync } from 'fs-extra'
import { bold, green } from 'kolorist'
import { join } from 'path'
import { fileURLToPath, URL } from 'url'

import type { result } from './type'
import { cd } from './utils'

/**
 * 获取模版文件夹所在点位置
 * @param dir
 * @returns
 */
const templatePath = (...dir: string[]) => fileURLToPath(new URL(`../template/${dir}`, import.meta.url))

const useTemplate = async (options: result) => {
  const { projectName, pickPresets, sameProjectDir } = options

  // 获取node进程的当前工作目录
  const cwd = process.cwd()
  const currentDir = join(cwd, projectName!)

  // 处理已经有一个相同的文件夹
  if (sameProjectDir) {
    removeSync(currentDir)
  } else {
    ensureDirSync(currentDir)
  }
  copySync(templatePath(pickPresets!), currentDir)

  await cd(currentDir)
  execaCommandSync('git init')
  console.log(`\n\n  ${bold(green(`进入${projectName}目录啦，正在安装依赖，请稍等...`))}\n\n`)

  execaCommandSync('pnpm i', { stdout: 'inherit' })
}

export default (options: result) => {
  const { pickPresets } = options

  if (pickPresets?.includes('npm')) {
    execaCommandSync('npm init vue@latest', { stdout: 'inherit' })
  } else {
    useTemplate(options)
  }
}

