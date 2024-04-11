<script lang="ts">
  import { appStorage } from "../../../../lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "../../../../lib/data/types";
  import NewSequenceForm from "../forms/NewSequenceForm.svelte";
  import TargetsConfigUrlEdit from "./TargetsConfigUrlEdit.svelte";

  export let url: string;
  let editMode = false;
  let addingSequenceToUrl = false;

  function toggleEditMode() {
    editMode = !editMode;
  }

  function toggleAddingSequenceToUrl() {
    addingSequenceToUrl = !addingSequenceToUrl;
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
