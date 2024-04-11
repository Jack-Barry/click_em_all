<script lang="ts">
  export let submissionErrors: string[] = [];
</script>

{#if submissionErrors.length}
  <div role="alert">
    <div>Submission error(s):</div>
    <ul>
      {#each submissionErrors as error}
        <li>{error}</li>
      {/each}
    </ul>
  </div>
{/if}
