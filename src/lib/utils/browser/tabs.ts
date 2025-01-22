import { browser } from 'wxt/browser'

export async function getActiveTab() {
  const activeTabs = await browser.tabs.query({ active: true })
  return activeTabs[0]
}
