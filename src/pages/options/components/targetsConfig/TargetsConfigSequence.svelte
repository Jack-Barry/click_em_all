<script lang="ts">
  import { type ClickerTarget } from "lib/Clicker/Clicker";
  import { appStorage } from "lib/data/extensionStorage";
  import type { ClickerTargetsConfigTargetSequence } from "lib/data/types";
  import { toggleStore, tryCatchStore } from "lib/common";

  import TargetsConfigTarget from "./TargetsConfigTarget.svelte";
  import EditSequenceForm from "lib/components/forms/EditSequenceForm.svelte";

  export let url: string;
  export let sequence: ClickerTargetsConfigTargetSequence;

  const { state: editMode, toggle: toggleEditMode } = toggleStore();
  const {
    state: addingTargetToSequence,
    toggle: toggleAddingTargetToSequence,
  } = toggleStore();

  const { errors: editSequenceErrors, submit: handleSave } = tryCatchStore(
    async function (event: CustomEvent<{ name: string }>) {
      await appStorage.targets.editSequence(url, sequence.id, {
        name: event.detail.name,
      });
      toggleEditMode();
    },
    "Encountered an error editing sequence"
  );

  async function removeSequence() {
    await appStorage.targets.removeSequence(url, sequence.id);
  }

  const { errors: addTargetErrors, submit: handleAddTargetToSequence } =
    tryCatchStore(async function (
      event: CustomEvent<{ target: ClickerTarget }>
    ) {
      await appStorage.targets.addTargetToSequence(
        url,
        sequence.id,
        event.detail.target
      );
      toggleAddingTargetToSequence();
    }, "Encountered an error adding target to sequence");

  let editingTargetIndex = -1;
  function toggleEditingTargetIndex(targetIndex: number) {
    if (editingTargetIndex < 0) {
      editingTargetIndex = targetIndex;
    } else {
      editingTargetIndex = -1;
    }
  }

  const { errors: updateTargetErrors, submit: updateTarget } = tryCatchStore(
    async function (
      event: CustomEvent<{ targetIndex: number; target: ClickerTarget }>
    ) {
      await appStorage.targets.editTarget(
        url,
        sequence.id,
        event.detail.targetIndex,
        event.detail.target
      );
      toggleEditingTargetIndex(event.detail.targetIndex);
    },
    "Encountered an error updating target"
  );

  const { errors: removeTargetErrors, submit: removeTarget } = tryCatchStore(
    async function (event: CustomEvent<number>) {
      await appStorage.targets.removeTargetFromSequence(
        url,
        sequence.id,
        event.detail
      );
    },
    "Encountered an error removing target"
  );
</script>

<div>
  {#if $editMode}
    <EditSequenceForm
      {sequence}
      submissionErrors={$editSequenceErrors}
      on:cancel={toggleEditMode}
      on:submit={handleSave}
    />
  {:else}
    <div>
      <span>{sequence.name}</span>
      <button on:click={toggleEditMode}>Edit Sequence</button>
      <button on:click={removeSequence}>Remove Sequence</button>
    </div>
  {/if}
  {#each sequence.targets as target, index}
    <TargetsConfigTarget
      targetIndex={index}
      existingTarget={target}
      editMode={editingTargetIndex === index}
      on:removeTarget={removeTarget}
      removeTargetErrors={$removeTargetErrors}
      on:toggleEditMode={(e) => {
        toggleEditingTargetIndex(e.detail);
      }}
      on:updateTarget={updateTarget}
      saveTargetErrors={$updateTargetErrors}
    />
  {/each}
  {#if $addingTargetToSequence}
    <TargetsConfigTarget
      editMode={true}
      saveTargetErrors={$addTargetErrors}
      on:saveTarget={handleAddTargetToSequence}
      on:toggleCreatingTarget={toggleAddingTargetToSequence}
    />
  {:else}
    <button on:click={toggleAddingTargetToSequence}>
      Add Target to Sequence
    </button>
  {/if}
  <hr />
</div>
