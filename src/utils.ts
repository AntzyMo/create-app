import { chdir } from 'node:process'
import { existsSync, readdirSync } from 'node:fs'

export const cd = async (path: string) => {
  try {
    await chdir(path)
    console.log(`New directory: ${path}`)
  } catch (err) {
    console.log(err, 'cderr')
  }
}

/**
 * 检测是否有相同名称的文件夹
 * @param name 文件夹名称
 * @returns
 */
export const hasDirName = (name: string) => {
  const hasDir = existsSync(name) && !!readdirSync(name).length
  return hasDir ? 'toggle' : null
}
