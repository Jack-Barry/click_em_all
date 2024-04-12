<script lang="ts">
  import EditUrlForm from "lib/components/forms/EditUrlForm.svelte";
  import NewSequenceForm from "lib/components/forms/NewSequenceForm.svelte";
  import { appStorage } from "lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "lib/data/types";
  import { toggleStore, tryCatchStore } from "lib/common";

  export let url: string;

  const { state: editMode, toggle: toggleEditMode } = toggleStore();
  const { state: addingSequenceToUrl, toggle: toggleAddingSequenceToUrl } =
    toggleStore();

  const { errors: saveErrors, submit: handleSave } = tryCatchStore(
    async function ({ detail }: CustomEvent) {
      await appStorage.targets.moveUrl(detail.oldUrl, detail.newUrl);
      toggleEditMode();
    },
    "Encountered an error, unable to save"
  );

  async function handleDelete() {
    await appStorage.targets.removeUrl(url);
  }

  const { errors: addSequenceErrors, submit: handleAddSequenceToUrl } =
    tryCatchStore(async function (
      event: CustomEvent<Omit<ClickerTargetsConfigTargetSequence, "id">>
    ) {
      await appStorage.targets.addSequence(url, event.detail);
      toggleAddingSequenceToUrl();
    }, "Encountered an error adding new sequence");
</script>

<div>
  {#if $editMode}
    <div>
      <EditUrlForm
        {url}
        submissionErrors={$saveErrors}
        on:submit={handleSave}
        on:cancelled={toggleEditMode}
      />
    </div>
  {:else}
    <div>
      <span class="monospace">{url}</span>
      <button on:click={toggleEditMode}>Edit</button>
      <button on:click={handleDelete}>Delete</button>
      {#if $addingSequenceToUrl}
        <NewSequenceForm
          on:cancel={toggleAddingSequenceToUrl}
          on:submit={handleAddSequenceToUrl}
          submissionErrors={$addSequenceErrors}
        />
      {:else}
        <button on:click={toggleAddingSequenceToUrl}>
          Add Sequence to URL
        </button>
      {/if}
    </div>
  {/if}
</div>
