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

  let saveError: string;
  async function handleSave({ detail }: CustomEvent) {
    saveError = "";
    try {
      await appStorage.targets.moveUrl(detail.oldUrl, detail.newUrl);
      editMode = false;
    } catch (e) {
      const message = (e as Error).message;
      if (message) {
        saveError = message;
      } else {
        saveError = "Encountered an error, unable to save";
      }
    }
  }

  async function handleDelete() {
    await appStorage.targets.removeUrl(url);
  }

  let addSequenceError: string = "";
  async function handleAddSequenceToUrl() {
    addSequenceError = "";
    if (!newSequenceName) {
      addSequenceError = "Name for new sequence is required";
    }

    if (addSequenceError) {
      return;
    }

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
        errorMessage={saveError}
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
          <label for="new_sequence_name">Name</label>
          <input
            id="new_sequence_name"
            name="name"
            bind:value={newSequenceName}
          />
          {#if addSequenceError}
            <div>{addSequenceError}</div>
          {/if}
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
