<script lang="ts">
  import browser from 'webextension-polyfill'

  async function openOptionsPage() {
    await browser.runtime.openOptionsPage()
  }
</script>

<style>
  main {
    padding: 1rem;
  }
</style>

<main>
  <h1>Click 'em All</h1>
  <button on:click={openOptionsPage}>Options</button>
</main>
