import { render, screen, waitFor } from '@testing-library/svelte'
import type { Tabs } from 'webextension-polyfill'
import ClickSequenceList from '../../../src/lib/components/ClickSequenceList.svelte'
import type { Config } from '../../../src/lib/models/config'
import { ConfigStorage } from '../../../src/lib/storage/ConfigStorage'
import * as browserTabUtils from '../../../src/lib/utils/browser/tabs'
import { _getConfig_, _getSequence_, _getUrl_ } from '../models/testUtils'

describe('ClickSequenceList', () => {
  let url: string
  let config: Config
  let activeTab: Tabs.Tab

  beforeEach(() => {
    url = _getUrl_()
    config = _getConfig_(url)
    config[url].push(_getSequence_())
    activeTab = {
      index: 0,
      highlighted: false,
      active: true,
      pinned: false,
      incognito: false,
      url
    }

    vi.spyOn(browserTabUtils, 'getActiveTab').mockResolvedValue(activeTab)
    vi.spyOn(ConfigStorage.prototype, 'getConfig').mockResolvedValue(config)
  })

  it('renders nothing if active tab has no URL', async () => {
    delete activeTab.url
    render(ClickSequenceList)

    for (const sequence of config[url]) {
      await waitFor(() => {
        const button = screen.queryByText(sequence.name)
        return expect(button).not.toBeInTheDocument()
      })
    }
  })

  it('renders nothing if no sequences are applicable to the active tab', async () => {
    const differentUrl = 'https://some.url.with.no.sequences'
    activeTab.url = differentUrl
    render(ClickSequenceList)

    for (const sequence of config[url]) {
      await waitFor(() => {
        const button = screen.queryByText(sequence.name)
        return expect(button).not.toBeInTheDocument()
      })
    }
  })

  it('renders button for each sequence applicable to the active tab', async () => {
    render(ClickSequenceList)

    for (const sequence of config[url]) {
      await waitFor(() => {
        const button = screen.queryByText(sequence.name)
        return expect(button).toBeInTheDocument()
      })
    }
  })
})
