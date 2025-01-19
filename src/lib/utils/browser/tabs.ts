import browser from 'webextension-polyfill'

export async function getActiveTab() {
  const activeTabs = await browser.tabs.query({ active: true })
  return activeTabs[0]
}
