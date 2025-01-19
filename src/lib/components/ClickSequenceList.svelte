<script lang="ts">
  import { type Tabs } from 'webextension-polyfill'
  import { getSequencesForUrl, type ClickSequence } from '../models/config'
  import { onMount } from 'svelte'
  import { getActiveTab } from '../utils/browser/tabs'
  import { ConfigStorage } from '../storage/ConfigStorage'

  const configStorage = ConfigStorage.getInstance()

  let activeTab: Tabs.Tab | undefined
  let activeTabSequences: ClickSequence[] = []

  onMount(async () => {
    activeTab = await getActiveTab()
    const activeTabUrl = activeTab.url

    if (!activeTabUrl) {
      activeTabSequences = []
    } else {
      const config = await configStorage.getConfig()
      activeTabSequences = getSequencesForUrl(config, activeTabUrl)
    }
  })
</script>

{#each activeTabSequences as sequence}
  <div>
    <button>{sequence.name}</button>
  </div>
{/each}
