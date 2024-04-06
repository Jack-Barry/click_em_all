<script lang="ts">
  import browser from "webextension-polyfill";

  let prettyEditMode = true;
  let optionsData: any;

  browser.storage.local.get("options").then((data) => {
    optionsData = data;
  });

  let submitError: any;
  async function handleFormSubmit(e: SubmitEvent) {
    submitError = undefined;
    const formData = new FormData(e.target as HTMLFormElement);
    const formDataObject = Array.from(formData.entries()).reduce<
      Record<string, any>
    >((result, [key, value]) => {
      result[key] = value;
      return result;
    }, {});

    if (formDataObject.rawJson) {
      try {
        const parsed = JSON.parse(formDataObject.rawJson);
        optionsData = { options: parsed };
        browser.storage.local.set(optionsData);
      } catch (e) {
        if (e instanceof SyntaxError) {
          if (e.message.startsWith("JSON.parse")) {
            submitError = "SyntaxError: Unable to parse input as JSON";
          } else {
            submitError = e.message;
          }
          return;
        }

        throw e;
      }
    }
  }
</script>

<main>
  <h1>Options</h1>
  <div>{JSON.stringify(optionsData)}</div>
  <div>
    {#if submitError}
      <div>{JSON.stringify(submitError)}</div>
    {/if}
    <label for="prettyEditMode">Pretty Edit Mode</label>
    <input
      name="prettyEditMode"
      type="checkbox"
      bind:checked={prettyEditMode}
    />
  </div>
  <form on:submit|preventDefault={handleFormSubmit}>
    <div>
      {#if prettyEditMode}
        <div>Pretty mode</div>
      {:else}
        <textarea name="rawJson" />
      {/if}
    </div>
    <button type="submit">Save</button>
  </form>
</main>
