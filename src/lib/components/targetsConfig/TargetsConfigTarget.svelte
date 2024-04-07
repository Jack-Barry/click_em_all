<script lang="ts">
  import { ClickerTargetStrategyType } from "../../Clicker/Clicker";
  import type { ClickerTargetsConfigTargetSequenceTarget } from "../../data/types";
  import { objectFromFormData } from "../../forms";

  export let target: ClickerTargetsConfigTargetSequenceTarget;

  let editMode = false;
  function toggleEditMode() {
    editMode = !editMode;
  }

  async function handleSave(e: SubmitEvent) {
    const data = objectFromFormData(e);
    console.log({ data });
    toggleEditMode();
  }
</script>

<div>
  {#if editMode}
    <form on:submit|preventDefault={handleSave}>
      <div>
        <label for="name">Name</label>
        <input name="name" />
        <!-- {#if newTargetErrors.target_name}
          <div>{newTargetErrors.target_name}</div>
        {/if} -->
      </div>
      <div>
        <label for="selector">Selector</label>
        <input name="selector" />
        <!-- {#if newTargetErrors.target_selector}
          <div>{newTargetErrors.target_selector}</div>
        {/if} -->
      </div>
      <div>
        <label for="strategy">Strategy</label>
        <select name="strategy">
          <option value={ClickerTargetStrategyType.whilePresent}>
            While Present
          </option>
          <option value={ClickerTargetStrategyType.allFound}>
            All Found
          </option>
        </select>
      </div>
      <div>
        <label for="max_clicks">Max Clicks</label>
        <input name="max_clicks" type="number" />
        <span>
          Leave this blank or set to 0 to indicate no max click amount
        </span>
        <!-- {#if newTargetErrors.target_max_clicks}
          <div>{newTargetErrors.target_max_clicks}</div>
        {/if} -->
      </div>
      <button type="button" on:click={toggleEditMode}>Cancel</button>
      <button type="submit">Save</button>
    </form>
  {:else}
    <div>Name: {target.name}</div>
    <div>Selector: <code>{target.selector}</code></div>
    <div>Strategy: {target.strategy}</div>
    <div>Max Clicks: <code>{target.maxClicks}</code></div>
    <button on:click={toggleEditMode}>Edit Target</button>
  {/if}
</div>
