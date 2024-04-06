<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let url = "";
  export let errorMessage = "";
  let newUrl = url;

  function onCancel() {
    dispatch("cancelled");
  }

  async function onSave() {
    if (newUrl.length) {
      dispatch("saved", { oldUrl: url, newUrl });
    }
  }
</script>

<form on:submit|preventDefault={onSave}>
  <div>
    <label for="url">URL</label>
    <!-- svelte-ignore a11y-autofocus -- Makes sense to move into this field when form is rendered -->
    <input name="url" bind:value={newUrl} autofocus />
    {#if errorMessage}
      <div>{errorMessage}</div>
    {/if}
  </div>
  <div>
    <button type="button" on:click={onCancel}>Cancel</button>
    <button type="submit">Save</button>
  </div>
</form>
