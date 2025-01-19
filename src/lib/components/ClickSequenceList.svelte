<script lang="ts">
  import { type Tabs } from 'webextension-polyfill'
  import { getSequencesForUrl, type ClickSequence, type ClickTarget } from '../models/config'
  import { onMount } from 'svelte'
  import { getActiveTab, sendClickEmAllMessage } from '../utils/popup/tabs'
  import { ConfigStorage } from '../storage/ConfigStorage'
  import { ClickerEvent, ClickerEventType } from '../utils/Clicker/ClickerEvent'
  import ClickingStatus from './ClickingStatus.svelte'

  const configStorage = ConfigStorage.getInstance()

  export let onMessage: typeof import('webext-bridge/popup').onMessage
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

  let clickerStatuses: Record<string, ClickerEvent<ClickerEventType>[]> = {}
  function clickEmAll(targets: ClickTarget[]) {
    clickerStatuses = {}
    if (!activeTab?.id) {
      return
    }

    sendClickEmAllMessage(activeTab, targets)
  }
</script>

{#each activeTabSequences as sequence}
  <div>
    <button
      on:click={() => {
        clickEmAll(sequence.targets)
      }}
    >
      {sequence.name}
    </button>
    <ClickingStatus
      {onMessage}
      statuses={clickerStatuses}
      on:statusChange={(update) => {
        console.debug(`Handling statusChange for update`, update)
        clickerStatuses = update.detail
      }}
    />
  </div>
{/each}
