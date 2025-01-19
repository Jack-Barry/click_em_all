import 'webext-bridge/background'
import browser from 'webextension-polyfill'
import { Logging } from '~/lib/utils/logging'

browser.runtime.onInstalled.addListener(() => {
  Logging.info('Extension installed')
})
