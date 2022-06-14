import prompts from 'prompts'
import { red } from 'kolorist'
import { existsSync, readdirSync } from 'fs'

import type { PromptObject } from 'prompts'
import { result } from './type'

const defaultProjectName = 'create-app'

/* 判断这个目录是否存在 并判断里面是否有文件 */
const hasProjectDir = (dir: string) => {
  return existsSync(dir) && !!readdirSync(dir).length
}

const options: PromptObject[] = [
  {
    name: 'projectName',
    type: 'text',
    message: 'Project Name:',
    initial: defaultProjectName
  },
  {
    name: 'hasProjectDir',
    type: () => (hasProjectDir(defaultProjectName) ? 'toggle' : null),
    message: 'Now Current directory has files. Do you wanting Remove existing files and continue?'
  },
  {
    name: 'checkStep',
    type: (prev, values) => {
      const { shouldOverwrite } = values
      if (shouldOverwrite && !shouldOverwrite) {
        throw new Error(red('✖') + ' 取消操作')
      }
      return null
    }
  },
  {
    name: 'pickPresets',
    type: 'select',
    message: '请选择一个预设',
    choices: [
      { title: 'vue ()', value: 'vue' },
      { title: 'react (eslint prettier husky)', value: 'react' }
    ]
  }
]

const initOptions = async () => {
  // try {
  // } catch (err) {
  //   process.exit(1)
  // }
  const result:result = await prompts(options,
    {
      onCancel: () => {
        throw new Error(red('✖') + ' 取消操作')
      }
    })
  return result
}

export default initOptions
