
import './command'

import execute from './execute'
import initOptions from './initOptions'

const result = await initOptions()
if (result) {
  execute(result)
}
