<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { type ClickerEvent, ClickerEventType } from '../utils/Clicker/ClickerEvent'

  import ClickingStatusItem from './ClickingStatusItem.svelte'
  import type { ClickTarget } from '../models/config'

  export let onMessage: typeof import('webext-bridge/popup').onMessage
  export let statuses: Record<string, ClickerEvent<ClickerEventType>[]> = {}

  const dispatch = createEventDispatcher<{
    statusChange: Record<string, ClickerEvent<ClickerEventType>[]>
  }>()

  let clickerErrors: ClickerEvent<ClickerEventType.error>[] = []

  onMessage('clickEmAllEvent', (msg) => {
    console.debug(`Received clickEmAllEvent message: ${JSON.stringify(msg)}`)
    const data = msg.data as unknown as ClickerEvent<ClickerEventType>
    if (data.type === ClickerEventType.error) {
      clickerErrors = [...clickerErrors, data]
      return
    }

    const targetName = (data.detail?.target as ClickTarget).name

    if (targetName) {
      dispatch('statusChange', {
        ...statuses,
        [targetName]: [...(statuses[targetName] || []), data]
      })
    }
  })
</script>

{#if clickerErrors.length}
  <div>
    <header>Errors</header>
    <ul>
      {#each clickerErrors as error}
        <li>{JSON.stringify(error.detail)}</li>
      {/each}
    </ul>
    <button
      on:click={() => {
        clickerErrors = []
      }}>Clear Errors</button
    >
  </div>
{/if}
{#each Object.entries(statuses) as [_, statusEntry]}
  <ClickingStatusItem event={statusEntry[statusEntry.length - 1]} />
{/each}
