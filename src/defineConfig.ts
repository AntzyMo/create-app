import prompts from 'prompts'
import { red } from 'kolorist'
import minimist from 'minimist'

import type { PromptObject } from 'prompts'
import type { presets, result } from './type'

import execute from './execute'
import { hasDirName, isUseNPM } from './utils'
const argv = minimist(process.argv.slice(2))

const firstArgv = argv._[0]
const defaultProjectName = firstArgv || 'create-app'

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
      type: prev => isUseNPM(prev, 'text'),
      message: 'Project Name:',
      initial: defaultProjectName
    },
    {
      name: 'sameProjectDir',
      type: () => hasDirName(defaultProjectName),
      message:
        'Now Current directory has files. Do you wanting Remove existing files and continue?',
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
  if (isData) execute(result)
}
