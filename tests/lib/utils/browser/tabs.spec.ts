import browser, { type Tabs } from 'webextension-polyfill'
import { getActiveTab } from '../../../../src/lib/utils/browser/tabs'

describe('utils: tabs', () => {
  describe('getActiveTab', () => {
    const tabsQuerySpy = vi.spyOn(browser.tabs, 'query')

    it('returns the currently active tab', async () => {
      const activeTabs = [{ index: 0 }, { index: 1 }] as Tabs.Tab[]
      tabsQuerySpy.mockResolvedValue(activeTabs)
      const activeTab = await getActiveTab()
      expect(activeTab).toBe(activeTabs[0])
    })
  })
})
