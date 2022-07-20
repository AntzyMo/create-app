import { existsSync, readdirSync } from 'fs'
import { red } from 'kolorist'
import minimist from 'minimist'
import type { PromptObject } from 'prompts'
import prompts from 'prompts'

import type { presets, result } from './type'

const argv = minimist(process.argv.slice(2))
const targetDir = argv._[0]
const defaultProjectName = targetDir || 'create-app'

/* 判断这个目录是否存在 并判断里面是否有文件 */
const hasProjectDir = (dir: string) => {
  return existsSync(dir) && !!readdirSync(dir).length
}

const optionsMap = (presetsMap: presets[]) => {
  const optMap: PromptObject[] = [
    {
      name: 'projectName',
      type: targetDir ? null : 'text',
      message: 'Project Name:',
      initial: defaultProjectName
    },
    {
      name: 'hasProjectDir',
      type: () => (hasProjectDir(defaultProjectName) ? 'toggle' : null),
      message:
        'Now Current directory has files. Do you wanting Remove existing files and continue?',
      initial: true,
      active: 'yes',
      inactive: 'no'
    },
    {
      name: 'checkStep',
      type: (_prev, values) => {
        const { shouldOverwrite } = values
        if (shouldOverwrite && !shouldOverwrite) {
          console.log(`  ${red('✖ 取消操作')}`)
        }
        return null
      }
    },
    {
      name: 'pickPresets',
      type: 'select',
      message: '请选择一个预设',
      choices: presetsMap
    }
  ]
  return optMap
}

const initialOptions = async (presetsMap: presets[]) => {
  try {
    const result: result = await prompts(optionsMap(presetsMap), {
      onCancel: () => {
        throw new Error('取消操作')
      }
    })
    return {
      projectName: defaultProjectName,
      ...result
    }
  } catch (err) {
    console.log(`  ${red(`✖ ${err.message}`)}`)
    process.exit(1) //  退出进程 1 代表失败
  }
}

export default initialOptions
