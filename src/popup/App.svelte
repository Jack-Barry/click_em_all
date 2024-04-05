<script lang="ts">
  import browser, { type Tabs } from "webextension-polyfill";
  import { sendMessage } from "webext-bridge/popup";
  import { openOptionsPage } from "../lib/utils";

  let activeTab: Tabs.Tab | undefined;
  browser.tabs.query({ active: true }).then((tab) => {
    activeTab = tab[0];
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
