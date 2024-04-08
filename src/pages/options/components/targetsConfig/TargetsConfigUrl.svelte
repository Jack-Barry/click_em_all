<script lang="ts">
  import { appStorage } from "../../../../lib/data/extensionStorage";
  import TargetsConfigUrlEdit from "./TargetsConfigUrlEdit.svelte";

  export let url: string;
  let editMode = false;
  let addingSequenceToUrl = false;
  let newSequenceName = "";

  function toggleEditMode() {
    editMode = !editMode;
  }

  function toggleAddingSequenceToUrl() {
    addingSequenceToUrl = !addingSequenceToUrl;
    if (!addingSequenceToUrl) {
      newSequenceName = "";
    }
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

  async function handleAddSequenceToUrl() {
    await appStorage.targets.addSequence(url, {
      name: newSequenceName,
      targets: [],
    });
    toggleAddingSequenceToUrl();
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
      {#if addingSequenceToUrl}
        <form on:submit|preventDefault={handleAddSequenceToUrl}>
          <header>New Sequence</header>
          <label for="sequence_name">Name</label>
          <input name="sequence_name" bind:value={newSequenceName} />
          <button type="button" on:click={toggleAddingSequenceToUrl}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </form>
      {:else}
        <button on:click={toggleAddingSequenceToUrl}>
          Add Sequence to URL
        </button>
      {/if}
    </div>
  {/if}
</div>
