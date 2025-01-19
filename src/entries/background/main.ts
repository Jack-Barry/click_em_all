import browser from 'webextension-polyfill'
import 'webext-bridge/background'

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})
