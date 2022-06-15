
import { green, bold } from 'kolorist'
import { removeSync, ensureDirSync, copySync } from 'fs-extra'
import { join, resolve, relative } from 'path'
import { result } from './type'

const cwd = process.cwd()

type template ='typescript-react' |'typescript-vue'
const templatePath = (...dir:template[]) => resolve(__dirname, '../template', ...dir)

const execute = (options:result) => {
  const { projectName, pickPresets, hasProjectDir } = options
  const root = join(cwd, projectName!)

  if (hasProjectDir) {
    removeSync(root)
  } else {
    ensureDirSync(root)
  }

  if (pickPresets === 'react') {
    copySync(templatePath('typescript-react'), root)
  }

  console.log('\nDone. Now run:\n')

  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${relative(cwd, root)}`))}`)
  }
  console.log(`  ${bold(green('pnpm install'))}\n\n`)
  // exec('pnpm i', {
  //   cwd: root
  // }, (err, studo) => {
  //   if (err) {
  //     console.log(err)
  //   }
  //   console.log(studo, 'studo')
  // })
}

export default execute