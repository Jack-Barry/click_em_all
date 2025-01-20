<script lang="ts">
  import type { ClickSequenceStatusListItem } from '~/entries/popup/types'
  import { formattedTimestamp } from '../utils/date'
  import { ClickerEventType } from '~/entries/contentScript/primary/Clicker'

  export let statusListItem: ClickSequenceStatusListItem
  const targetName =
    (
      statusListItem as ClickSequenceStatusListItem<
        | ClickerEventType.foundElements
        | ClickerEventType.reachedMaxClicks
        | ClickerEventType.clickedElements
      >
    ).data.targetName ?? ''
  const elementCount =
    (statusListItem as ClickSequenceStatusListItem<ClickerEventType.foundElements>).data
      .elementCount ?? 0
  const configuredMaximum =
    (statusListItem as ClickSequenceStatusListItem<ClickerEventType.reachedMaxClicks>).data
      .configuredMaximium ?? NaN
  const clickCount =
    (statusListItem as ClickSequenceStatusListItem<ClickerEventType.clickedElements>).data
      .clickCount ?? 0
</script>

<div>
  <span><code>{formattedTimestamp(new Date(statusListItem.timestamp))}</code>: </span>
  {#if statusListItem.messageType === ClickerEventType.beganClicking}
    <span>Began clicking</span>
  {:else if statusListItem.messageType === ClickerEventType.foundElements}
    {#if elementCount < 1}
      <span>No elements found for {targetName}</span>
    {:else}
      <span>Found {elementCount} element{elementCount === 1 ? '' : 's'} for {targetName}</span>
    {/if}
  {:else if statusListItem.messageType === ClickerEventType.reachedMaxClicks}
    <span>Reached configured maximum clicks for {targetName} ({configuredMaximum})</span>
  {:else if statusListItem.messageType === ClickerEventType.clickedElements}
    <span>Clicked {targetName} {clickCount} time{clickCount === 1 ? '' : 's'}</span>
  {:else if statusListItem.messageType === ClickerEventType.finishedClicking}
    <span>Finished clicking</span>
  {:else if statusListItem.messageType === ClickerEventType.error}
    <span>ERROR:</span><span>{JSON.stringify(statusListItem)}</span>
  {:else}
    <span>{JSON.stringify(statusListItem)}</span>
  {/if}
</div>
