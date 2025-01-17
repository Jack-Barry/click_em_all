<script lang="ts">
  import browser from 'webextension-polyfill';

  async function openOptionsPage() {
    await browser.runtime.openOptionsPage();
  }
</script>

<button on:click={openOptionsPage}>Options</button>
