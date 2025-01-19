<script lang="ts">
  import { onMessage, sendMessage } from 'webext-bridge/popup'
  import { type Tabs } from 'webextension-polyfill'
  import { getSequencesForUrl, type ClickSequence } from '../models/config'
  import { onMount } from 'svelte'
  import { getActiveTab } from '../utils/browser/tabs'
  import { ConfigStorage } from '../storage/ConfigStorage'
  import { IpcMessageIds } from '../constants'
  import {
    ClickerEventType,
    type ClickerEventDetail
  } from '~/entries/contentScript/primary/Clicker'
  import type { ClickSequenceStatusLists } from '~/entries/popup/types'
  import { Logging } from '../utils/logging'
  import ClickSequenceStatusList from './ClickSequenceStatusList.svelte'

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

  const clickSequenceStatusLists: ClickSequenceStatusLists = {}
  function appendToStatusList(message: Parameters<Parameters<typeof onMessage>[1]>[0]) {
    const messageType = message.id as ClickerEventType
    const data = message.data as ClickerEventDetail
    Logging.debug(
      `Appending ${messageType} message to ${data.sequenceName} status list`,
      JSON.stringify(message)
    )

    if (clickSequenceStatusLists[data.sequenceName] === undefined) {
      clickSequenceStatusLists[data.sequenceName] = []
    }

    clickSequenceStatusLists[data.sequenceName] = [
      ...clickSequenceStatusLists[data.sequenceName],
      { messageType, data, timestamp: message.timestamp }
    ]
  }

  onMessage(ClickerEventType.beganClicking, appendToStatusList)
  onMessage(ClickerEventType.finishedClicking, appendToStatusList)
</script>

{#each activeTabSequences as sequence}
  <div>
    <button
      on:click={() => {
        sendMessage(IpcMessageIds.executeClickSequence, sequence, `content-script@${activeTab?.id}`)
      }}>{sequence.name}</button
    >
    <ClickSequenceStatusList
      clickSequenceStatusList={clickSequenceStatusLists[sequence.name] || []}
    />
  </div>
{/each}
