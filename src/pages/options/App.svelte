<script lang="ts">
  import { onMount } from "svelte";
  import type { ClickerTargetsConfig } from "../../lib/data/types";
  import { appStorage } from "../../lib/data/extensionStorage";
  import Browser from "webextension-polyfill";
  import { StoredOptionsKeys } from "../../lib/data/extensionStorage/constants";
  import TargetsConfigUrl from "./components/targetsConfig/TargetsConfigUrl.svelte";
  import TargetsConfigUrlEdit from "./components/targetsConfig/TargetsConfigUrlEdit.svelte";
  import TargetsConfigSequence from "./components/targetsConfig/TargetsConfigSequence.svelte";

  let targets: ClickerTargetsConfig = {};
  let addingNewUrl = false;

  function toggleAddingNewUrl() {
    addingNewUrl = !addingNewUrl;
  }

  $: targetsAsArray = Object.entries(targets);

  onMount(async () => {
    targets = await appStorage.targets.get();
    Browser.storage.local.onChanged.addListener((changes) => {
      if (changes[StoredOptionsKeys.targets]?.newValue) {
        targets = changes[StoredOptionsKeys.targets]?.newValue;
      }
    });
  });
</script>

<main>
  <h1>Options</h1>
  <div>
    <h2>How does it work?</h2>
    <div>
      <ul>
        <li>
          For each website you want to have a clicking config for, add its URL.
          Typically you'll want to leave off query params and such.
        </li>
        <li>
          For each URL, you can have more than one named "sequence" of targets
          to click. For example, if the first target has a strategy of <code
            >"whenVisible"</code
          >, and the second has a strategy of <code>"allFound"</code>, the first
          target will be clicked until it is no longer visible, then the second
          target will click all matching instances at the same time.
        </li>
      </ul>
    </div>
  </div>
  <hr />
  {#each targetsAsArray as [url, sequences]}
    <div>
      <TargetsConfigUrl {url} />
      {#each sequences as sequence}
        <TargetsConfigSequence {url} {sequence} />
      {/each}
    </div>
  {/each}
  {#if addingNewUrl}
    <TargetsConfigUrlEdit
      on:saved={async ({ detail }) => {
        await appStorage.targets.addUrl(detail.newUrl);
        toggleAddingNewUrl();
      }}
      on:cancelled={toggleAddingNewUrl}
    />
  {:else}
    <button on:click={toggleAddingNewUrl}>Add URL</button>
  {/if}
</main>
