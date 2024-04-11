<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ClickerTargetsConfigTargetSequence } from "../../../../lib/data/types";
  import { clickerTargetSequenceSchema } from "../../../../lib/data/schemas";
  import FormSubmissionErrors from "../../../../lib/components/forms/FormSubmissionErrors.svelte";
  import FormInput from "../../../../lib/components/forms/FormInput.svelte";
  import { formStoreZod } from "../../../../lib/components/forms/formStoreZod";

  export let submissionErrors: string[] = [];

  const dispatch = createEventDispatcher<{
    submit: Omit<ClickerTargetsConfigTargetSequence, "id">;
    cancel: undefined;
  }>();

  const { applyValidationErrors, store } = formStoreZod({ name: "" });
  const { hasChanges, hasErrors, fields } = store;
  let newSequence: Omit<ClickerTargetsConfigTargetSequence, "id"> = {
    name: "",
    targets: [],
  };

  function onSubmit() {
    dispatch("submit", newSequence);
  }

  function onCancel() {
    dispatch("cancel");
  }

  $: {
    store.clearErrors();
    newSequence = { ...newSequence, name: $fields.name.value };

    const validationResult = clickerTargetSequenceSchema
      .omit({ id: true, targets: true })
      .safeParse(newSequence);

    if (!validationResult.success) {
      const formatted = validationResult.error.format();
      applyValidationErrors(formatted);
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <header>New Sequence</header>
  <FormSubmissionErrors {submissionErrors} />
  <div>
    <FormInput
      formStore={store}
      id="new_sequence_name"
      key="name"
      label="Name"
    />
  </div>
  <button type="button" on:click={onCancel}>Cancel</button>
  <button type="submit" disabled={$hasErrors || !$hasChanges}>Save</button>
</form>
