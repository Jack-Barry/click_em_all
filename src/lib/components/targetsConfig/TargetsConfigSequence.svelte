<script lang="ts">
  import app from "../../../pages/options";
  import { ClickerTargetStrategyType } from "../../Clicker/Clicker";
  import { appStorage } from "../../data/extensionStorage";
  import type {
    ClickerTargetsConfigTargetSequence,
    ClickerTargetsConfigTargetSequenceTarget,
  } from "../../data/types";
  import { objectFromFormData } from "../../forms";
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

  let newTargetErrors = {
    target_name: "",
    target_selector: "",
    target_strategy: "",
    target_max_clicks: "",
  };
  async function handleAddTargetToSequence(e: SubmitEvent) {
    newTargetErrors = {
      target_name: "",
      target_selector: "",
      target_strategy: "",
      target_max_clicks: "",
    };
    const data = objectFromFormData(e);
    if (!data.target_name) {
      newTargetErrors.target_name = "Name is required";
    }

    if (!data.target_selector) {
      newTargetErrors.target_selector = "Selector is required";
    }

    const newTarget: ClickerTargetsConfigTargetSequenceTarget = {
      name: data.target_name,
      selector: data.target_selector,
      strategy: data.target_strategy,
      maxClicks: parseInt(data.target_max_clicks) || Infinity,
    };

    if (Object.values(newTargetErrors).some((v) => !!v)) {
      newTargetErrors = newTargetErrors;
      return;
    }

    await appStorage.targets.addTargetToSequence(url, sequence.id, newTarget);
    toggleAddingTargetToSequence();
  }

  async function removeTarget(index: number) {
    await appStorage.targets.removeTargetFromSequence(url, sequence.id, index);
  }
</script>

<div>
  {#if editMode}
    <form on:submit|preventDefault={handleSave}>
      <label for="sequence_name">Name</label>
      <input name="sequence_name" bind:value={newName} />
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
    <div>
      <TargetsConfigTarget {target} />
      <button
        on:click={() => {
          removeTarget(index);
        }}
      >
        Remove Target
      </button>
    </div>
  {/each}
  {#if addingTargetToSequence}
    <form on:submit|preventDefault={handleAddTargetToSequence}>
      <div>
        <label for="target_name">Name</label>
        <input name="target_name" />
        {#if newTargetErrors.target_name}
          <div>{newTargetErrors.target_name}</div>
        {/if}
      </div>
      <div>
        <label for="target_selector">Selector</label>
        <input name="target_selector" />
        {#if newTargetErrors.target_selector}
          <div>{newTargetErrors.target_selector}</div>
        {/if}
      </div>
      <div>
        <label for="target_strategy">Strategy</label>
        <select name="target_strategy">
          <option value={ClickerTargetStrategyType.whilePresent}>
            While Present
          </option>
          <option value={ClickerTargetStrategyType.allFound}>
            All Found
          </option>
        </select>
      </div>
      <div>
        <label for="target_max_clicks">Max Clicks</label>
        <input name="target_max_clicks" type="number" />
        <span>
          Leave this blank or set to 0 to indicate no max click amount
        </span>
        {#if newTargetErrors.target_max_clicks}
          <div>{newTargetErrors.target_max_clicks}</div>
        {/if}
      </div>
      <button type="button" on:click={toggleAddingTargetToSequence}>
        Cancel
      </button>
      <button type="submit">Save</button>
    </form>
  {:else}
    <button on:click={toggleAddingTargetToSequence}>
      Add Target to Sequence
    </button>
  {/if}
  <hr />
</div>
