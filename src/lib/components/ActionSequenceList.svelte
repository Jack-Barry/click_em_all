<script lang="ts">
  import { onMessage, sendMessage } from 'webext-bridge/popup'
  import { getSequencesForUrl, type ActionSequence } from '../models/config'
  import { onMount } from 'svelte'
  import { getActiveTab } from '../utils/browser/tabs'
  import { ConfigStorage } from '../storage/ConfigStorage'
  import { IpcMessageIds } from '../constants'
  import { Logging } from '../utils/Logging'
  import ActionSequenceStatusList from './ActionSequenceStatusList.svelte'
  import type { Tabs } from 'wxt/browser'
  import {
    SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
    SequenceRunnerEventType,
    type SequenceRunnerEventDetail
  } from '../SequenceRunner'
  import type { ActionSequenceStatusLists } from '../types'

  const configStorage = ConfigStorage.getInstance()

  let activeTab: Tabs.Tab | undefined
  let activeTabSequences: ActionSequence[] = []

  onMount(async () => {
    activeTab = await getActiveTab()
    const activeTabUrl = activeTab?.url

    if (!activeTabUrl) {
      activeTabSequences = []
    } else {
      const config = await configStorage.getConfig()
      activeTabSequences = getSequencesForUrl(config, activeTabUrl)
    }
  })

  const actionSequenceStatusLists: ActionSequenceStatusLists = {}

  onMessage(SEQUENCE_RUNNER_EMITTED_EVENT_TYPE, (sequenceRunnerEvent) => {
    const detail = sequenceRunnerEvent.data as SequenceRunnerEventDetail
    Logging.debug(
      `Appending ${detail.messageType} message to ${detail.sequenceName} status list`,
      JSON.stringify(sequenceRunnerEvent)
    )

    if (
      actionSequenceStatusLists[detail.sequenceName] === undefined ||
      detail.messageType === SequenceRunnerEventType.beganExecuting
    ) {
      actionSequenceStatusLists[detail.sequenceName] = []
    }

    actionSequenceStatusLists[detail.sequenceName] = [
      ...actionSequenceStatusLists[detail.sequenceName],
      { timestamp: sequenceRunnerEvent.timestamp, detail }
    ]
  })
</script>

{#each activeTabSequences as sequence}
  <div>
    <button
      on:click={() => {
        sendMessage(IpcMessageIds.executeSequence, sequence, `content-script@${activeTab?.id}`)
      }}>{sequence.name}</button
    >
    <ActionSequenceStatusList
      actionSequenceStatusList={actionSequenceStatusLists[sequence.name] || []}
    />
  </div>
{/each}
