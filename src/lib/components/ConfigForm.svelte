<script lang="ts">
  import { derived, writable, type Writable } from 'svelte/store'
  import { validateConfig, type SchemaValidationError } from '../models/config'

  const id = 'config'

  let configAsString = writable('{}')
  let configErrors: Writable<SchemaValidationError[] | undefined> = writable([])
  let isValidConfig = derived(configAsString, ($cfg) => {
    try {
      const cfgObject = JSON.parse($cfg)
      const validationResult = validateConfig(cfgObject)
      const validationErrors = validationResult.error?.errors
      configErrors.set(validationErrors)
      return !validationErrors || !(validationErrors.length > 0)
    } catch {
      return false
    }
  })
</script>

<form>
  <label for={id}>Config</label>
  <textarea {id} bind:value={$configAsString} />
  <button type="submit" disabled={!$isValidConfig}>Save Config</button>
  {#if $configErrors && $configErrors.length > 0}
    {#each $configErrors as configError}
      <div>{JSON.stringify(configError.path)}:{configError.message}</div>
    {/each}
  {/if}
</form>
