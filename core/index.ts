import execute from './execute'
import initOptions from './initOptions'

const init = async () => {
  const result = await initOptions()
  execute(result)
}

init()
