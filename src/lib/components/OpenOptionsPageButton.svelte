<script lang="ts">
  import { browser } from 'wxt/browser'

  async function openOptionsPage() {
    await browser.runtime.openOptionsPage()
  }
</script>

<button on:click={openOptionsPage}>Options</button>
