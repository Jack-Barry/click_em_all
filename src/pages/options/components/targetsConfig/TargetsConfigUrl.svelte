<script lang="ts">
  import EditUrlForm from "lib/components/forms/EditUrlForm.svelte";
  import NewSequenceForm from "lib/components/forms/NewSequenceForm.svelte";
  import { appStorage } from "lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "lib/data/types";

  export let url: string;
  let editMode = false;
  let addingSequenceToUrl = false;

  function toggleEditMode() {
    editMode = !editMode;
  }

  function toggleAddingSequenceToUrl() {
    addingSequenceToUrl = !addingSequenceToUrl;
  }

  let saveErrors: string[];
  async function handleSave({ detail }: CustomEvent) {
    saveErrors = [];
    try {
      await appStorage.targets.moveUrl(detail.oldUrl, detail.newUrl);
      editMode = false;
    } catch (e) {
      const message = (e as Error).message;
      if (message) {
        saveErrors = [message];
      } else {
        saveErrors = ["Encountered an error, unable to save"];
      }
    }
  }

  async function handleDelete() {
    await appStorage.targets.removeUrl(url);
  }

  let addSequenceErrors: string[] = [];
  async function handleAddSequenceToUrl(
    event: CustomEvent<Omit<ClickerTargetsConfigTargetSequence, "id">>
  ) {
    addSequenceErrors = [];

    try {
      await appStorage.targets.addSequence(url, event.detail);
      toggleAddingSequenceToUrl();
    } catch {
      addSequenceErrors = ["Faild to add new sequence"];
    }
  }
</script>

<div>
  {#if editMode}
    <div>
      <EditUrlForm
        {url}
        submissionErrors={saveErrors}
        on:submit={handleSave}
        on:cancelled={toggleEditMode}
      />
    </div>
  {:else}
    <div>
      <span class="monospace">{url}</span>
      <button on:click={toggleEditMode}>Edit</button>
      <button on:click={handleDelete}>Delete</button>
      {#if addingSequenceToUrl}
        <NewSequenceForm
          on:cancel={toggleAddingSequenceToUrl}
          on:submit={handleAddSequenceToUrl}
          submissionErrors={addSequenceErrors}
        />
      {:else}
        <button on:click={toggleAddingSequenceToUrl}>
          Add Sequence to URL
        </button>
      {/if}
    </div>
  {/if}
</div>
