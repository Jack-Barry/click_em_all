<script lang="ts">
  import { appStorage } from "../../data/extensionStorage";
  import TargetsConfigUrlEdit from "./TargetsConfigUrlEdit.svelte";

  export let url: string;
  let editMode = false;

  function toggleEditMode() {
    editMode = !editMode;
  }

  let errorMessage: string;
  async function handleSave({ detail }: CustomEvent) {
    errorMessage = "";
    try {
      await appStorage.targets.moveUrl(detail.oldUrl, detail.newUrl);
      editMode = false;
    } catch (e) {
      const message = (e as Error).message;
      if (message) {
        errorMessage = message;
      } else {
        errorMessage = "Encountered an error, unable to save";
      }
    }
  }

  async function handleDelete() {
    await appStorage.targets.removeUrl(url);
  }
</script>

<div>
  {#if editMode}
    <div>
      <TargetsConfigUrlEdit
        {url}
        {errorMessage}
        on:saved={handleSave}
        on:cancelled={toggleEditMode}
      />
    </div>
  {:else}
    <div>
      <span class="monospace">{url}</span>
      <button on:click={toggleEditMode}>Edit</button>
      <button on:click={handleDelete}>Delete</button>
    </div>
  {/if}
</div>
