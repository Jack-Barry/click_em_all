<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import type { ClickerTarget } from "lib/Clicker/Clicker";
  import { formStoreZod } from "./utils/formStoreZod";
  import {
    ClickerTargetStrategyType,
    clickerTargetSchema,
  } from "lib/Clicker/schemas";
  import FormSubmissionErrors from "./utils/FormSubmissionErrors.svelte";
  import FormInput from "./utils/FormInput.svelte";
  import FormSelect from "./utils/FormSelect.svelte";

  export let submissionErrors: string[] = [];
  export let target: ClickerTarget = {
    name: "",
    selector: "",
    strategy: ClickerTargetStrategyType.whilePresent,
  };

  const dispatch = createEventDispatcher<{
    submit: ClickerTarget;
    cancel: undefined;
  }>();

  function maxClicksString(t: ClickerTarget): string {
    if (t.maxClicks === Infinity) {
      return "";
    }

    return t.maxClicks?.toString() ?? "";
  }
  const { applyValidationErrors, store } = formStoreZod({
    ...target,
    maxClicks: maxClicksString(target),
  });
  const { hasChanges, hasErrors, values } = store;

  function onSubmit() {
    dispatch("submit", target);
  }

  function onCancel() {
    dispatch("cancel");
  }

  $: {
    store.clearErrors();
    target = {
      name: $values.name,
      selector: $values.selector,
      strategy: $values.strategy as ClickerTargetStrategyType,
      maxClicks: parseInt($values.maxClicks) || Infinity,
    };

    const validationResult = clickerTargetSchema.safeParse(target);

    if (!validationResult.success) {
      const formatted = validationResult.error.format();
      applyValidationErrors(formatted);
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <header>Target</header>
  <FormSubmissionErrors {submissionErrors} />
  <div>
    <FormInput formStore={store} id="target_name" key="name" label="Name" />
    <FormInput
      formStore={store}
      id="target_selector"
      key="selector"
      label="Selector"
    />
    <FormSelect
      formStore={store}
      id="target_strategy"
      key="strategy"
      label="Strategy"
      options={[
        {
          value: ClickerTargetStrategyType.whilePresent,
          text: "While Present",
        },
        {
          value: ClickerTargetStrategyType.allFound,
          text: "All Found",
        },
      ]}
    />
    <FormInput
      formStore={store}
      id="target_max_clicks"
      key="maxClicks"
      label="Max Clicks"
      type="number"
    />
  </div>
  <button type="button" on:click={onCancel}>Cancel</button>
  <button type="submit" disabled={$hasErrors || !$hasChanges}>Save</button>
</form>
