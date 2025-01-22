import 'webext-bridge/background'
import { Logging } from '../lib/utils/Logging'

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    Logging.info('Extension installed')
  })
})
