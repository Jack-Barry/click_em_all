<script lang="ts">
  import type { FormStoreField } from "./formStore";

  export let id: string;
  export let fieldState: FormStoreField;
</script>

<div {id}>
  {#if (fieldState.touched || fieldState.hasChanged) && fieldState.errors.length}
    <ul>
      {#each fieldState.errors as error}
        <li>{error}</li>
      {/each}
    </ul>
  {/if}
</div>
