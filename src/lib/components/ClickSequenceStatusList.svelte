<script lang="ts">
  import type { ClickSequenceStatusList } from '~/entries/popup/types'
  import ClickSequenceStatusListItem from './ClickSequenceStatusListItem.svelte'

  export let clickSequenceStatusList: ClickSequenceStatusList
</script>

{#each clickSequenceStatusList as statusListItem}
  <ClickSequenceStatusListItem {statusListItem} />
{/each}
