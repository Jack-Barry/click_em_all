<script lang="ts">
  import browser, { type Tabs } from "webextension-polyfill";
  import { openOptionsPage } from "../lib/utils";

  let activeTab: Tabs.Tab | undefined;
  browser.tabs.query({ active: true }).then((tab) => {
    activeTab = tab[0];
  });

  function doStuffInTab() {
    console.log("hello from tab");
  }

  let clickError: string | undefined;
  async function clickEmAll() {
    clickError = undefined;

    if (!activeTab?.id || !activeTab.url?.startsWith("https:")) {
      clickError = "must have a webpage open to click things";
      return;
    }

    await browser.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: doStuffInTab,
    });
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
