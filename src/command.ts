import { Command } from 'commander'
import { version } from '../package.json'

const program = new Command()

program.option('-v, --versions').option('-s, --show', 'show template')
program.parse(process.argv)
const options:Record<('show'|'versions'), string> = program.opts()

if (options.versions) {
  console.log(version)
  process.exit()
}

if (options.show) {
  console.log(' vue3-ts \n react-ts')
  process.exit()
}
