<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    ClickerTargetStrategyType,
    type ClickerTarget,
  } from "../../../../lib/Clicker/Clicker";

  const dispatch = createEventDispatcher();

  export let existingTarget: ClickerTarget = {
    name: "",
    selector: "",
    strategy: ClickerTargetStrategyType.whilePresent,
  };
  export let editMode = false;
  let editedTarget = { ...existingTarget };

  let saveErrors = {
    name: "",
    selector: "",
    strategy: "",
    maxClicks: "",
  };
  async function handleSave() {
    saveErrors = {
      name: "",
      selector: "",
      strategy: "",
      maxClicks: "",
    };

    if (!editedTarget.name) {
      saveErrors.name = "Name is required";
    }

    if (!editedTarget.selector) {
      saveErrors.selector = "Selector is required";
    }

    if (!editedTarget.strategy) {
      saveErrors.strategy = "Strategy is required";
    }

    if (editedTarget.maxClicks && editedTarget.maxClicks < 1) {
      saveErrors.maxClicks = "Max clicks must be at least 1 if provided";
    }

    const target: ClickerTarget = {
      name: editedTarget.name,
      selector: editedTarget.selector,
      strategy: editedTarget.strategy,
      maxClicks: editedTarget.maxClicks || Infinity,
    };

    if (Object.values(saveErrors).some((v) => !!v)) {
      saveErrors = saveErrors;
      return;
    }

    dispatch("saveTarget", target);
  }

  function toggleEditMode() {
    dispatch("toggleEditMode");
  }
</script>

<div>
  {#if editMode}
    <form on:submit|preventDefault={handleSave}>
      <div>
        <label for="name">Name</label>
        <input name="name" bind:value={editedTarget.name} />
        {#if saveErrors.name}
          <div>{saveErrors.name}</div>
        {/if}
      </div>
      <div>
        <label for="selector">Selector</label>
        <input name="selector" bind:value={editedTarget.selector} />
        {#if saveErrors.selector}
          <div>{saveErrors.selector}</div>
        {/if}
      </div>
      <div>
        <label for="strategy">Strategy</label>
        <select name="strategy" bind:value={editedTarget.strategy}>
          <option value={ClickerTargetStrategyType.whilePresent}>
            While Present
          </option>
          <option value={ClickerTargetStrategyType.allFound}>
            All Found
          </option>
        </select>
        {#if saveErrors.strategy}
          <div>{saveErrors.strategy}</div>
        {/if}
      </div>
      <div>
        <label for="maxClicks">Max Clicks</label>
        <input
          name="maxClicks"
          type="number"
          bind:value={editedTarget.maxClicks}
        />
        <span>
          Leave this blank or set to 0 to indicate no max click amount
        </span>
        {#if saveErrors.maxClicks}
          <div>{saveErrors.maxClicks}</div>
        {/if}
      </div>
      <button type="button" on:click={toggleEditMode}>Cancel</button>
      <button type="submit">Save</button>
    </form>
  {:else}
    <div>Name: {existingTarget.name}</div>
    <div>Selector: <code>{existingTarget.selector}</code></div>
    <div>Strategy: {existingTarget.strategy}</div>
    <div>Max Clicks: <code>{existingTarget.maxClicks}</code></div>
    <button on:click={toggleEditMode}>Edit Target</button>
  {/if}
</div>
