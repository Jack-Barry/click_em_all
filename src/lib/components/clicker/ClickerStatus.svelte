<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import {
    ClickerEventType,
    type ClickerEvent,
  } from "lib/Clicker/ClickerEvent";

  import ClickerStatusItem from "./ClickerStatusItem.svelte";

  export let onMessage: typeof import("webext-bridge/popup").onMessage;
  export let statuses: Record<string, ClickerEvent<ClickerEventType>[]> = {};

  const dispatch = createEventDispatcher<{
    statusChange: Record<string, ClickerEvent<ClickerEventType>[]>;
  }>();

  let clickerErrors: ClickerEvent<ClickerEventType.error>[] = [];

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
