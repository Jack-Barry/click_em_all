<script lang="ts">
  import { onMount } from "svelte";
  import type { ClickerTargetsConfig } from "../../lib/data/types";
  import { appStorage } from "../../lib/data/extensionStorage";
  import Browser from "webextension-polyfill";
  import { StoredOptionsKeys } from "../../lib/data/extensionStorage/constants";
  import TargetsConfigUrl from "../../lib/components/targetsConfig/TargetsConfigUrl.svelte";
  import TargetsConfigUrlEdit from "../../lib/components/targetsConfig/TargetsConfigUrlEdit.svelte";
  import TargetsConfigSequence from "../../lib/components/targetsConfig/TargetsConfigSequence.svelte";

  let targets: ClickerTargetsConfig = {};

  onMount(async () => {
    targets = await appStorage.targets.get();
    Browser.storage.local.onChanged.addListener((changes) => {
      if (changes[StoredOptionsKeys.targets]?.newValue) {
        targets = changes[StoredOptionsKeys.targets]?.newValue;
      }
    });
  });

  $: targetsAsArray = Object.entries(targets);

  // async function setDummyData() {
  //   await appStorage.targets.addGroup(
  //     "https://www.albertsons.com/foru/coupons-deals.html",

  //     {
  //       name: "Clip All Coupons",
  //       targets: [
  //         {
  //           name: "Load More Button",
  //           selector: ".btn.load-more",
  //           strategy: ClickerTargetStrategyType.whilePresent,
  //         },
  //         {
  //           name: "Clip Coupon Button",
  //           selector: "[id^=couponAddBtn]",
  //           strategy: ClickerTargetStrategyType.allFound,
  //         },
  //       ],
  //     }
  //   );
  // }

  // async function clearDummyData() {
  //   await appStorage.targets.removeUrl(
  //     "https://www.albertsons.com/foru/coupons-deals.html"
  //   );
  // }
  // import browser from "webextension-polyfill";

  // let prettyEditMode = true;
  // let optionsData: any;

  // browser.storage.local.get("options").then((data) => {
  //   optionsData = data;
  // });

  // let submitError: any;
  // async function handleFormSubmit(e: SubmitEvent) {
  //   submitError = undefined;
  //   const formData = new FormData(e.target as HTMLFormElement);
  //   const formDataObject = Array.from(formData.entries()).reduce<
  //     Record<string, any>
  //   >((result, [key, value]) => {
  //     result[key] = value;
  //     return result;
  //   }, {});

  //   if (formDataObject.rawJson) {
  //     try {
  //       const parsed = JSON.parse(formDataObject.rawJson);
  //       optionsData = { options: parsed };
  //       browser.storage.local.set(optionsData);
  //     } catch (e) {
  //       if (e instanceof SyntaxError) {
  //         if (e.message.startsWith("JSON.parse")) {
  //           submitError = "SyntaxError: Unable to parse input as JSON";
  //         } else {
  //           submitError = e.message;
  //         }
  //         return;
  //       }

  //       throw e;
  //     }
  //   }
  // }
  let addingNewUrl = false;
  function toggleAddingNewUrl() {
    addingNewUrl = !addingNewUrl;
  }
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
  <!-- {#each targetGroups as targetGroup}
        <div style="margin-left: 1rem;">
          <div>Group Name: {targetGroup.name}</div>
          {#each targetGroup.targets as target}
            <div style="margin-left: 1rem;">
              <div>Target Name: {target.name}</div>
              <div style="margin-left: 1rem;">
                <div>
                  Selector: <span class="monospace">{target.selector}</span>
                </div>
                <div>Strategy: {target.strategy}</div>
                <div>
                  Max Clicks: <span class="monospace"
                    >{target.maxClicks || Infinity}</span
                  >
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/each}-->
  <!-- <hr />
    </div>
  {/each} -->

  <!-- <button on:click={setDummyData}>Seed</button>
  <button on:click={clearDummyData}>Clear</button> -->
  <!-- <div>{JSON.stringify(optionsData)}</div>
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
  </form> -->
</main>
