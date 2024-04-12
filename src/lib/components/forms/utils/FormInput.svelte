<script lang="ts" generics="K extends string">
  import type { FormStore } from "./formStore";
  import FormInputErrors from "./FormInputErrors.svelte";

  export let formStore: FormStore<K>;
  export let key: K;
  export let id: string;
  export let label: string;

  const { fields, onInput, onBlur } = formStore;
  const descriptionId = `${id}_desc`;
</script>

<label for={id}>{label}</label>
<input
  {id}
  name={key}
  aria-details={descriptionId}
  value={$fields[key].value}
  on:input={onInput}
  on:blur={onBlur}
  {...$$restProps}
/>
<FormInputErrors id={descriptionId} fieldState={$fields[key]} />
