<script lang="ts">
  import { derived, writable, type Writable } from 'svelte/store'
  import { validateConfig, type SchemaValidationError } from '../models/config'
  import { ConfigStorage } from '../storage/ConfigStorage'
  import { onDestroy, onMount } from 'svelte'
  import { prettyJson } from '../utils/json'

  const id = 'config'
  const configStorage = ConfigStorage.getInstance()

  let configAsString = writable('{}')
  let configErrors: Writable<SchemaValidationError[]> = writable([])
  let isValidConfig = derived(configAsString, ($cfg) => {
    try {
      const cfgObject = JSON.parse($cfg)
      const validationResult = validateConfig(cfgObject)
      const validationErrors = validationResult.error?.errors || []
      configErrors.set(validationErrors)
      return !(validationErrors.length > 0)
    } catch {
      return false
    }
  })

  const listenerId = 'update-config-form'
  onMount(async function () {
    const config = await configStorage.getConfig()
    configAsString.set(prettyJson(config))

    configStorage.addChangeListener(listenerId, (config) => {
      configAsString.set(prettyJson(config))
    })
  })

  onDestroy(() => {
    configStorage.removeChangeListener(listenerId)
  })

  let configSaved = false
  async function submitConfig(event: SubmitEvent) {
    const formData = new FormData(event.target as HTMLFormElement)
    const configInput = formData.get(id)
    if (configInput) {
      const updatedConfig = JSON.parse(configInput as string)
      await configStorage.setConfig(updatedConfig)
      configAsString.set(prettyJson(updatedConfig))
      configSaved = true
      setTimeout(() => {
        configSaved = false
      }, 1500)
    }
  }
</script>

<form on:submit|preventDefault={submitConfig} class="display-flex flex-column width-fit-content">
  <div>
    <label for={id}>Config</label>
  </div>
  <div>
    <textarea {id} name={id} bind:value={$configAsString} cols={80} rows={20}></textarea>
  </div>
  <div class="display-flex flex-justify-end">
    <button type="submit" disabled={!$isValidConfig || configSaved}>
      {#if configSaved}
        <span>Config Saved</span>
      {:else}
        <span>Save Config</span>
      {/if}
    </button>
  </div>
</form>
{#each $configErrors as configError}
  <div>{JSON.stringify(configError.path)}:{configError.message}</div>
{/each}
