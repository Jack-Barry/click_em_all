<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { clickerTargetUrlSchema } from "lib/data/schemas";
  import FormInput from "lib/components/forms/utils/FormInput.svelte";
  import { formStore } from "lib/components/forms/utils/formStore";
  import FormSubmissionErrors from "lib/components/forms/utils/FormSubmissionErrors.svelte";

  const dispatch = createEventDispatcher<{
    cancelled: undefined;
    submit: { oldUrl: string; newUrl: string };
  }>();

  export let url = "";
  export let submissionErrors: string[];

  const store = formStore({ url });
  const { fields, hasChanges, hasErrors, clearErrors, setErrorsOnField } =
    store;

  function onCancel() {
    dispatch("cancelled");
  }

  async function onSubmit() {
    dispatch("submit", { oldUrl: url, newUrl: $fields.url.value });
  }

  $: {
    clearErrors();
    const validationResult = clickerTargetUrlSchema.safeParse(
      $fields.url.value
    );

    if (!validationResult.success) {
      const formatted = validationResult.error.format();
      setErrorsOnField("url", formatted._errors);
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <FormSubmissionErrors {submissionErrors} />
  <div>
    <FormInput
      formStore={store}
      id="url_input"
      key="url"
      label="URL"
      autofocus
    />
  </div>
  <div>
    <button type="button" on:click={onCancel}>Cancel</button>
    <button type="submit" disabled={$hasErrors || !$hasChanges}>Save</button>
  </div>
</form>
