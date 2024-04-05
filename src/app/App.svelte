<script lang="ts">
  import browser, { type Tabs } from "webextension-polyfill";
  import { openOptionsPage } from "../lib/utils";

  let activeTab: Tabs.Tab;
  browser.tabs.query({ active: true }).then((tab) => {
    activeTab = tab[0];
  });
</script>

<main>
  <h1>Click 'em All</h1>
  <button on:click={openOptionsPage}>Options</button>
  <div>{JSON.stringify(activeTab)}</div>
</main>

<style>
  main {
    padding: 1rem;
  }
</style>
