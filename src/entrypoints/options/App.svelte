<script lang="ts">
  import ConfigExplanation from '../../lib/components/ConfigExplanation.svelte'
  import ConfigForm from '../../lib/components/ConfigForm.svelte'
</script>

<main>
  <h1>Options</h1>
  <div class="display-flex flex-gap-32">
    <ConfigForm />
    <ConfigExplanation />
  </div>
</main>
