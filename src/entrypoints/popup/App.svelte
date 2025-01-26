<script lang="ts">
  import ActionSequenceList from '../../lib/components/ActionSequenceList.svelte'
  import OpenOptionsPageButton from '../../lib/components/OpenOptionsPageButton.svelte'
</script>

<main>
  <div class="display-flex flex-column flex-gap-4">
    <ActionSequenceList></ActionSequenceList>
    <div>
      <hr />
    </div>
    <div class="display-flex flex-justify-end">
      <OpenOptionsPageButton></OpenOptionsPageButton>
    </div>
  </div>
</main>
