import { sendMessage } from 'webext-bridge/popup'
import browser, { type Tabs } from 'webextension-polyfill'
import type { ClickTarget } from '~/lib/models/config'

export async function getActiveTab() {
  const activeTabs = await browser.tabs.query({ active: true })
  return activeTabs[0]
}

export function sendClickEmAllMessage(tab: Tabs.Tab, targets: ClickTarget[]) {
  console.debug(`Sending clickeEmAll message to tab with ID: ${tab.id}`)
  sendMessage('clickEmAll', targets, `content-script@${tab.id}`)
}
