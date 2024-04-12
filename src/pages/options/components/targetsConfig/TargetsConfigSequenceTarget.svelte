<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ClickerTarget } from "lib/Clicker/Clicker";

  import TargetsConfigTarget from "./TargetsConfigTarget.svelte";

  const dispatch = createEventDispatcher();

  export let target: ClickerTarget;
  export let targetIndex: number;
  export let editMode = false;
  export let updateErrors: string[] = [];
  export let removeTargetErrors: string[] = [];

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
    saveTargetErrors={updateErrors}
    on:saveTarget={updateTarget}
    on:toggleEditMode={toggleEditMode}
  />
  {#if !editMode}
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
