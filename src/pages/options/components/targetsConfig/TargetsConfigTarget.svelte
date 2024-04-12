<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { type ClickerTarget } from "lib/Clicker/Clicker";
  import EditSequenceTargetForm from "lib/components/forms/EditSequenceTargetForm.svelte";

  const dispatch = createEventDispatcher<{
    saveTarget: ClickerTarget;
    toggleEditMode: undefined;
  }>();

  export let saveTargetErrors: string[] = [];
  export let existingTarget: ClickerTarget | undefined = undefined;
  export let editMode = false;

  async function handleSave(event: CustomEvent<ClickerTarget>) {
    dispatch("saveTarget", event.detail);
  }

  function toggleEditMode() {
    dispatch("toggleEditMode");
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
  {:else}
    {#if existingTarget}
      <div>Name: {existingTarget.name}</div>
      <div>Selector: <code>{existingTarget.selector}</code></div>
      <div>Strategy: {existingTarget.strategy}</div>
      <div>Max Clicks: <code>{existingTarget.maxClicks}</code></div>
    {/if}
    <button on:click={toggleEditMode}>Edit Target</button>
  {/if}
</div>
