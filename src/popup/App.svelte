<script lang="ts">
  import browser, { type Tabs } from "webextension-polyfill";
  import { onMessage, sendMessage } from "webext-bridge/popup";
  import { openOptionsPage } from "../lib/utils";
  import type { ClickerEvent } from "../lib/Clicker/ClickerEvent";

  let activeTab: Tabs.Tab | undefined;
  browser.tabs.query({ active: true }).then((tab) => {
    activeTab = tab[0];
  });

  let status = "";
  onMessage("clickEmAllEvent", (msg) => {
    console.log("clickEmAll event", msg);
    status = (msg.data as unknown as ClickerEvent).type;
  });

  let clickError: string | undefined;
  function clickEmAll() {
    if (!activeTab?.id) {
      return;
    }

    sendMessage(
      "clickEmAll",
      { hello: "from popup" },
      `content-script@${activeTab.id}`
    );
  }
</script>

<main>
  {#if status}
    <div>{status}</div>
  {/if}
  <button
    on:click={() => {
      clickEmAll();
    }}>Click 'em All</button
  >
  {#if clickError}
    <div>{clickError}</div>
  {/if}
  <button on:click={openOptionsPage}>Options</button>
</main>

<style>
  main {
    padding: 1rem;
  }
</style>
