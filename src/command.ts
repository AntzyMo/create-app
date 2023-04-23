import { Command } from 'commander'

import { version } from '../package.json'

const program = new Command()

program.option('-v, --version', 'output the current version')
program.option('--git', '绑定 git 仓库')

program.parse(process.argv)

const options = program.opts()

if (options.version) {
  console.log(version)
  process.exit()
}
