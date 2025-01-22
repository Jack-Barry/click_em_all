<script lang="ts">
  import { SequenceRunnerEventType, type SomeSequenceRunnerEventDetail } from '../SequenceRunner'
  import type { ActionSequenceStatusListItem } from '../types'
  import { formattedTimestamp } from '../utils/date'

  export let statusListItem: ActionSequenceStatusListItem
  const messageType = statusListItem.detail.messageType
  const {
    targetName = '',
    elementCount = NaN,
    configuredMaximum = NaN,
    clickCount = NaN
  } = statusListItem.detail as SomeSequenceRunnerEventDetail
</script>

<div>
  <span><code>{formattedTimestamp(new Date(statusListItem.timestamp))}</code>: </span>
  {#if messageType === SequenceRunnerEventType.beganExecuting}
    <span>Began running sequence</span>
  {:else if messageType === SequenceRunnerEventType.foundElements}
    {#if elementCount < 1}
      <span>No elements found for {targetName}</span>
    {:else}
      <span>Found {elementCount} element{elementCount === 1 ? '' : 's'} for {targetName}</span>
    {/if}
  {:else if messageType === SequenceRunnerEventType.reachedMaxClicks}
    <span>Reached configured maximum clicks for {targetName} ({configuredMaximum})</span>
  {:else if messageType === SequenceRunnerEventType.clickedElements}
    <span>Clicked {targetName} {clickCount} time{clickCount === 1 ? '' : 's'}</span>
  {:else if messageType === SequenceRunnerEventType.finishedExecuting}
    <span>Finished running sequence</span>
  {:else if messageType === SequenceRunnerEventType.error}
    <span>ERROR:</span><span>{JSON.stringify(statusListItem)}</span>
  {:else}
    <span>{JSON.stringify(statusListItem)}</span>
  {/if}
</div>
