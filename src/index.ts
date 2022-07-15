
import execute from './execute'
import initOptions from './initOptions'
import './command'

const result = await initOptions()
if (result) {
  execute(result)
}
