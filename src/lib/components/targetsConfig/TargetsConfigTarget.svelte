<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { type ClickerTarget } from "lib/Clicker/Clicker";
  import EditSequenceTargetForm from "lib/components/forms/EditSequenceTargetForm.svelte";

  const dispatch = createEventDispatcher<{
    toggleCreatingTarget: undefined;
    toggleEditMode: number;
    removeTarget: number;
    saveTarget: { targetIndex?: number; target: ClickerTarget };
  }>();

  export let targetIndex: number | undefined = undefined;
  export let existingTarget: ClickerTarget | undefined = undefined;
  export let saveTargetErrors: string[] = [];
  export let removeTargetErrors: string[] = [];
  export let editMode = false;

  async function handleSave(event: CustomEvent<ClickerTarget>) {
    dispatch("saveTarget", { targetIndex, target: event.detail });
  }

  function removeTarget() {
    if (typeof targetIndex !== "number") {
      throw new Error("Cannot remove target without index");
    }

    dispatch("removeTarget", targetIndex);
  }

  function toggleEditMode() {
    if (typeof targetIndex !== "number") {
      dispatch("toggleCreatingTarget");
      return;
    }

    dispatch("toggleEditMode", targetIndex);
  }
</script>

<div>
  {#if editMode}
    <EditSequenceTargetForm
      target={existingTarget}
      submissionErrors={saveTargetErrors}
      on:cancel={toggleEditMode}
      on:submit={handleSave}
    />
  {:else if existingTarget}
    <div>Name: {existingTarget.name}</div>
    <div>Selector: <code>{existingTarget.selector}</code></div>
    <div>Strategy: {existingTarget.strategy}</div>
    <div>Max Clicks: <code>{existingTarget.maxClicks}</code></div>
    <button on:click={toggleEditMode}>Edit Target</button>
    {#if removeTargetErrors.length}
      <div role="alert">
        <ul>
          {#each removeTargetErrors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    {/if}
    <button on:click={removeTarget}>Remove Target</button>
  {/if}
</div>
