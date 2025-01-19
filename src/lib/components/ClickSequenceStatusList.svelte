<script lang="ts">
  import { ClickerEventType } from '~/entries/contentScript/primary/Clicker'
  import type { ClickSequenceStatusList } from '~/entries/popup/types'
  import { formattedTimestamp } from '../utils/date'

  export let clickSequenceStatusList: ClickSequenceStatusList
</script>

{#each clickSequenceStatusList as statusEntry}
  <div>
    <span>{formattedTimestamp(new Date(statusEntry.timestamp))}: </span>
    {#if statusEntry.messageType === ClickerEventType.beganClicking}
      <span>Began clicking</span>
    {:else if statusEntry.messageType === ClickerEventType.finishedClicking}
      <span>Finished clicking</span>
    {:else if statusEntry.messageType === ClickerEventType.error}
      <span>ERROR:</span><span>{JSON.stringify(statusEntry)}</span>
    {:else}
      <span>{JSON.stringify(statusEntry)}</span>
    {/if}
  </div>
{/each}
