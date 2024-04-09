<script lang="ts">
  import { onMount } from "svelte";
  import type { ClickerTargetsConfig } from "../../lib/data/types";
  import {
    ExtensionStorage,
    appStorage,
  } from "../../lib/data/extensionStorage";
  import Browser from "webextension-polyfill";
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
      if (changes[ExtensionStorage.STORAGE_KEYS.TARGETS]?.newValue) {
        targets = changes[ExtensionStorage.STORAGE_KEYS.TARGETS]?.newValue;
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
          Typically you'll want to leave off query params and such, since as you
          navigate, URLs from the current tab are matched by prefixes in your
          config.
        </li>
        <li>
          For each URL, you can have more than one named "sequence" of targets
          to click.
        </li>
        <li>
          Each "sequence" of targets will be iterated over when you click its
          triggering button. The triggering button will be visible any time you
          are on a page that has a URL beginning with the sequence's parent URL.
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
