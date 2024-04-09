<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TargetsConfigTarget from "./TargetsConfigTarget.svelte";
  import type { ClickerTarget } from "../../../../lib/Clicker/Clicker";

  const dispatch = createEventDispatcher();

  export let target: ClickerTarget;
  export let targetIndex: number;
  export let editMode = false;

  function toggleEditMode() {
    dispatch("toggleEditMode", targetIndex);
  }

  function removeTarget() {
    dispatch("removeTarget", targetIndex);
  }

  function updateTarget(event: CustomEvent<ClickerTarget>) {
    dispatch("updateTarget", { targetIndex, target: event.detail });
  }
</script>

<div>
  <TargetsConfigTarget
    existingTarget={target}
    {editMode}
    on:saveTarget={updateTarget}
    on:toggleEditMode={toggleEditMode}
  />
  {#if !editMode}
    <button on:click={removeTarget}> Remove Target </button>
  {/if}
</div>
