<script lang="ts">
  import { onMessage } from "webext-bridge/popup";
  import {
    ClickerEventType,
    type ClickerEvent,
  } from "../../../../lib/Clicker/ClickerEvent";
  import ClickerStatusItem from "./ClickerStatusItem.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let statuses: Record<string, ClickerEvent<ClickerEventType>[]> = {};
  onMessage("clickEmAllEvent", (msg) => {
    const data = msg.data as unknown as ClickerEvent<ClickerEventType>;
    const targetId = data.detail?.target.id;

    if (targetId) {
      dispatch("statusChange", {
        ...statuses,
        [targetId]: [...(statuses[targetId] || []), data],
      });
    }
  });
</script>

{#each Object.entries(statuses) as [_, statusEntry]}
  <ClickerStatusItem event={statusEntry[statusEntry.length - 1]} />
{/each}
