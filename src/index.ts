
import execute from './execute'
import initOptions from './initOptions'

(async function () {
  const result = await initOptions()
  if (result) {
    execute(result)
  }
})()
