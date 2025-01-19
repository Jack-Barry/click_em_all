<script lang="ts">
  import { onMessage } from 'webext-bridge/popup'
  import ClickSequenceList from '~/lib/components/ClickSequenceList.svelte'
  import OpenOptionsPageButton from '~/lib/components/OpenOptionsPageButton.svelte'
</script>

<main>
  <ClickSequenceList {onMessage} />
  <OpenOptionsPageButton />
</main>
