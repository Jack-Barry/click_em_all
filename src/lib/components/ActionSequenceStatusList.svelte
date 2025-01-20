<script lang="ts">
  import type { ActionSequenceStatusList } from '~/entries/popup/types'
  import ActionSequenceStatusListItem from './ActionSequenceStatusListItem.svelte'

  export let actionSequenceStatusList: ActionSequenceStatusList
</script>

{#each actionSequenceStatusList as statusListItem}
  <ActionSequenceStatusListItem {statusListItem} />
{/each}
