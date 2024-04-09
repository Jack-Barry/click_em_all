<script lang="ts">
  import { onMount } from "svelte";
  import browser, { type Tabs } from "webextension-polyfill";
  import { sendMessage } from "webext-bridge/popup";
  import type { ClickerTargetsConfigTargetSequence } from "../../lib/data/types";
  import { appStorage } from "../../lib/data/extensionStorage";
  import {
    ClickerEventType,
    type ClickerEvent,
  } from "../../lib/Clicker/ClickerEvent";
  import ClickerStatus from "./components/clicker/ClickerStatus.svelte";
  import type { ClickerTarget } from "../../lib/Clicker/Clicker";

  let activeTab: Tabs.Tab | undefined;
  let matchingSequences: ClickerTargetsConfigTargetSequence[] = [];
  onMount(async () => {
    const activeTabs = await browser.tabs.query({ active: true });
    activeTab = activeTabs[0];

    if (!activeTab?.url) {
      matchingSequences = [];
    } else {
      const allSequences = await appStorage.targets.get();
      matchingSequences = Object.entries(allSequences)
        .filter(([key]) => activeTab?.url?.startsWith(key))
        .map(([_, value]) => value)
        .flat();
    }
  });

  async function openOptionsPage() {
    await browser.runtime.openOptionsPage();
  }

  let clickerStatuses: Record<string, ClickerEvent<ClickerEventType>[]> = {};
  function clickEmAll(targets: ClickerTarget[]) {
    clickerStatuses = {};
    if (!activeTab?.id) {
      return;
    }

    sendMessage("clickEmAll", targets as any, `content-script@${activeTab.id}`);
  }
</script>

<main>
  {#each matchingSequences as sequence}
    <div>
      <button
        on:click={() => {
          clickEmAll(sequence.targets);
        }}
      >
        {sequence.name}
      </button>
    </div>
  {/each}
  <ClickerStatus
    statuses={clickerStatuses}
    on:statusChange={(update) => (clickerStatuses = update.detail)}
  />
  <button on:click={openOptionsPage}>Options</button>
</main>

<style>
  main {
    padding: 1rem;
  }
</style>
