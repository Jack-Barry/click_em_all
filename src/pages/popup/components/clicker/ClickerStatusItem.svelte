<script lang="ts">
  import {
    type ClickerEvent,
    ClickerEventType,
    type ClickerEventDetail,
  } from "../../../../lib/Clicker/ClickerEvent";

  export let event: ClickerEvent<ClickerEventType>;
  $: detail = event?.detail as ClickerEventDetail<ClickerEventType>;
  $: target = detail?.target;
</script>

<div>
  {#if event?.type === ClickerEventType.foundElements}
    <div>Found {detail?.count} instances of "{target?.name}"</div>
  {:else if event?.type === ClickerEventType.maxClicksReached}
    <div>Reached max clicks for "{target?.name}": {target?.maxClicks}</div>
  {:else if event?.type === ClickerEventType.clickedElements}
    <div>Clicked "{target?.name}" {detail?.count} times</div>
  {/if}
</div>
