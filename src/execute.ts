
import { join } from 'node:path'
import { copySync, ensureDirSync, removeSync } from 'fs-extra'

import { cd } from './utils'
import type { result } from './type'

let execaCommandSync = null
import('execa').then(execa => {
  execaCommandSync = execa.execaCommandSync
})

/**
 * 获取模版文件夹所在点位置
 * @param dir
 * @returns
 */
const templatePath = (...dir: string[]) => join(__dirname, '../template', ...dir)

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

