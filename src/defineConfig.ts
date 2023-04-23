import prompts from 'prompts'
import { red } from 'kolorist'
import minimist from 'minimist'

import type { PromptObject } from 'prompts'
import type { presets, result } from './type'

import execute from './execute'
import { hasDirName } from './utils'
const { _, git } = minimist(process.argv.slice(2))

const defaultProjectName = _[0]

interface defineConfig {
  presets: presets[]
}

const createQuestions = (questionMap: defineConfig) => {
  const { presets } = questionMap
  const optMap: PromptObject[] = [
    {
      name: 'pickPresets',
      type: 'select',
      message: '请选择一个预设',
      choices: presets
    },
    {
      name: 'projectName',
      type: (git || defaultProjectName) ? null : 'text',
      message: 'Project Name:',
      initial: 'create-app'
    },
    {
      name: 'sameProjectDir',
      type: () => hasDirName(defaultProjectName),
      message:
        '现在当前目录有文件。 是否要删除现有文件并继续?',
      initial: true,
      active: 'yes',
      inactive: 'no'
    }
  ]
  return optMap
}

export default async (options: defineConfig) => {
  const result: result = await prompts(createQuestions(options), { onCancel: () => console.log(`  ${red('✖ 取消操作')}`) })
  const isData = Object.keys(result).length
  const parmas = {
    ...result,
    git,
    defaultProjectName
  }
  if (isData) execute(parmas)
}
