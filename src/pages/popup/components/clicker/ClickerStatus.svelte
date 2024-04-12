<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMessage } from "webext-bridge/popup";

  import {
    ClickerEventType,
    type ClickerEvent,
  } from "lib/Clicker/ClickerEvent";

  import ClickerStatusItem from "./ClickerStatusItem.svelte";

  const dispatch = createEventDispatcher<{
    statusChange: Record<string, ClickerEvent<ClickerEventType>[]>;
  }>();

  let clickerErrors: ClickerEvent<ClickerEventType.error>[] = [];
  export let statuses: Record<string, ClickerEvent<ClickerEventType>[]> = {};
  onMessage("clickEmAllEvent", (msg) => {
    const data = msg.data as unknown as ClickerEvent<ClickerEventType>;
    if (data.type === ClickerEventType.error) {
      clickerErrors = [...clickerErrors, data];
      return;
    }

    const targetId = data.detail?.target.id;

    if (targetId) {
      dispatch("statusChange", {
        ...statuses,
        [targetId]: [...(statuses[targetId] || []), data],
      });
    }
  });
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
        clickerErrors = [];
      }}>Clear Errors</button
    >
  </div>
{/if}
{#each Object.entries(statuses) as [_, statusEntry]}
  <ClickerStatusItem event={statusEntry[statusEntry.length - 1]} />
{/each}
