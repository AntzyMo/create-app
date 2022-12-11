import { existsSync, readdirSync } from 'fs'
import { chdir } from 'process'
import type { PromptType } from 'prompts'

export const cd = async (path: string) => {
  try {
    await chdir(path)
    console.log(`New directory: ${process.cwd()}`)
  } catch (err) {
    console.log(err, 'cderr')
  }
}

/**
 * 是否用 npm 指令
 * @param value 选项的值
 * @param promptsType prompts 的类型
 * @returns
 */
export const isUseNPM = (value: string, promptsType: PromptType) => value.includes('npm') ? null : promptsType

/**
 * 检测是否有相同名称的文件夹
 * @param name 文件夹名称
 * @returns
 */
export const hasDirName = (name: string) => {
  const hasDir = existsSync(name) && !!readdirSync(name).length
  return hasDir ? 'toggle' : null
}
