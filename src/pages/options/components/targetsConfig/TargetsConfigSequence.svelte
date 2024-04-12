<script lang="ts">
  import { type ClickerTarget } from "lib/Clicker/Clicker";
  import { appStorage } from "lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "lib/data/types";

  import TargetsConfigSequenceTarget from "./TargetsConfigSequenceTarget.svelte";
  import TargetsConfigTarget from "./TargetsConfigTarget.svelte";
  import { errorMessage } from "lib/errors";

  export let url: string;
  export let sequence: ClickerTargetsConfigTargetSequence;

  let editMode = false;
  let newName = sequence.name;
  let addingTargetToSequence = false;

  function toggleEditMode() {
    editMode = !editMode;
  }

  async function handleSave() {
    await appStorage.targets.editSequence(url, sequence.id, { name: newName });
    toggleEditMode();
  }

  async function removeSequence() {
    await appStorage.targets.removeSequence(url, sequence.id);
  }

  function toggleAddingTargetToSequence() {
    addingTargetToSequence = !addingTargetToSequence;
  }

  let addTargetErrors: string[] = [];
  async function handleAddTargetToSequence(event: CustomEvent<ClickerTarget>) {
    addTargetErrors = [];
    try {
      await appStorage.targets.addTargetToSequence(
        url,
        sequence.id,
        event.detail
      );
      toggleAddingTargetToSequence();
    } catch (e) {
      addTargetErrors = [
        errorMessage(e, "Encountered an error adding target to sequence"),
      ];
    }
  }

  let editingTargetIndex = -1;
  function toggleEditingTargetIndex(targetIndex: number) {
    if (editingTargetIndex < 0) {
      editingTargetIndex = targetIndex;
    } else {
      editingTargetIndex = -1;
    }
  }

  let updateTargetErrors: string[] = [];
  async function updateTarget(
    event: CustomEvent<{ targetIndex: number; target: ClickerTarget }>
  ) {
    updateTargetErrors = [];
    try {
      await appStorage.targets.editTarget(
        url,
        sequence.id,
        event.detail.targetIndex,
        event.detail.target
      );
      toggleEditingTargetIndex(event.detail.targetIndex);
    } catch (e) {
      updateTargetErrors = [
        errorMessage(e, "Encountered an error updating target"),
      ];
    }
  }

  let removeTargetErrors: string[] = [];
  async function removeTarget(event: CustomEvent<number>) {
    removeTargetErrors = [];
    try {
      await appStorage.targets.removeTargetFromSequence(
        url,
        sequence.id,
        event.detail
      );
    } catch (e) {
      removeTargetErrors = [
        errorMessage(e, "Encountered an error removing target"),
      ];
    }
  }
</script>

<div>
  {#if editMode}
    <form on:submit|preventDefault={handleSave}>
      <label for="name">Name</label>
      <input name="name" bind:value={newName} />
      <button type="button" on:click={toggleEditMode}>Cancel</button>
      <button type="submit">Save</button>
    </form>
  {:else}
    <div>
      <span>{sequence.name}</span>
      <button on:click={toggleEditMode}>Edit Sequence</button>
      <button on:click={removeSequence}>Remove Sequence</button>
    </div>
  {/if}
  {#each sequence.targets as target, index}
    <TargetsConfigSequenceTarget
      {target}
      targetIndex={index}
      editMode={editingTargetIndex === index}
      on:removeTarget={removeTarget}
      {removeTargetErrors}
      on:toggleEditMode={(e) => {
        toggleEditingTargetIndex(e.detail);
      }}
      on:updateTarget={updateTarget}
      updateErrors={updateTargetErrors}
    />
  {/each}
  {#if addingTargetToSequence}
    <TargetsConfigTarget
      editMode={true}
      saveTargetErrors={addTargetErrors}
      on:saveTarget={handleAddTargetToSequence}
      on:toggleEditMode={toggleAddingTargetToSequence}
    />
  {:else}
    <button on:click={toggleAddingTargetToSequence}>
      Add Target to Sequence
    </button>
  {/if}
  <hr />
</div>
