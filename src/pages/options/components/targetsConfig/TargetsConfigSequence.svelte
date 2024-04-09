<script lang="ts">
  import { type ClickerTarget } from "../../../../lib/Clicker/Clicker";
  import { appStorage } from "../../../../lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "../../../../lib/data/types";
  import TargetsConfigSequenceTarget from "./TargetsConfigSequenceTarget.svelte";
  import TargetsConfigTarget from "./TargetsConfigTarget.svelte";

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

  async function handleAddTargetToSequence(event: CustomEvent<ClickerTarget>) {
    await appStorage.targets.addTargetToSequence(
      url,
      sequence.id,
      event.detail
    );
    toggleAddingTargetToSequence();
  }

  let editingTargetIndex = -1;
  function toggleEditingTargetIndex(targetIndex: number) {
    if (editingTargetIndex < 0) {
      editingTargetIndex = targetIndex;
    } else {
      editingTargetIndex = -1;
    }
  }
  async function updateTarget(
    event: CustomEvent<{ targetIndex: number; target: ClickerTarget }>
  ) {
    await appStorage.targets.editTarget(
      url,
      sequence.id,
      event.detail.targetIndex,
      event.detail.target
    );
    toggleEditingTargetIndex(event.detail.targetIndex);
  }

  async function removeTarget(event: CustomEvent<number>) {
    await appStorage.targets.removeTargetFromSequence(
      url,
      sequence.id,
      event.detail
    );
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
      on:toggleEditMode={(e) => {
        toggleEditingTargetIndex(e.detail);
      }}
      on:updateTarget={updateTarget}
    />
  {/each}
  {#if addingTargetToSequence}
    <TargetsConfigTarget
      editMode={true}
      on:toggleEditMode={toggleAddingTargetToSequence}
      on:saveTarget={handleAddTargetToSequence}
    />
  {:else}
    <button on:click={toggleAddingTargetToSequence}>
      Add Target to Sequence
    </button>
  {/if}
  <hr />
</div>
