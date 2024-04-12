<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { clickerTargetSequenceSchema } from "lib/data/schemas";
  import type { ClickerTargetsConfigTargetSequence } from "lib/data/types";
  import FormInput from "lib/components/forms/utils/FormInput.svelte";
  import { formStoreZod } from "lib/components/forms/utils/formStoreZod";
  import FormSubmissionErrors from "lib/components/forms/utils/FormSubmissionErrors.svelte";

  export let sequence: Omit<ClickerTargetsConfigTargetSequence, "id"> = {
    name: "",
    targets: [],
  };
  export let submissionErrors: string[] = [];
  let editedSequence = { ...sequence };

  const dispatch = createEventDispatcher<{
    submit: Omit<ClickerTargetsConfigTargetSequence, "id">;
    cancel: undefined;
  }>();

  const { applyValidationErrors, store } = formStoreZod({ name: "" });
  const { hasChanges, hasErrors, fields } = store;

  function onSubmit() {
    dispatch("submit", editedSequence);
  }

  function onCancel() {
    dispatch("cancel");
  }

  $: {
    store.clearErrors();
    editedSequence = { ...editedSequence, name: $fields.name.value };

    const validationResult = clickerTargetSequenceSchema
      .omit({ id: true, targets: true })
      .safeParse(editedSequence);

    if (!validationResult.success) {
      const formatted = validationResult.error.format();
      applyValidationErrors(formatted);
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <header>Sequence</header>
  <FormSubmissionErrors {submissionErrors} />
  <div>
    <FormInput formStore={store} id="sequence_name" key="name" label="Name" />
  </div>
  <button type="button" on:click={onCancel}>Cancel</button>
  <button type="submit" disabled={$hasErrors || !$hasChanges}>Save</button>
</form>
