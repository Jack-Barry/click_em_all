<script lang="ts">
  import browser, { type Tabs } from "webextension-polyfill";
  import { onMessage, sendMessage } from "webext-bridge/popup";
  import { openOptionsPage } from "../lib/utils";
  import {
    ClickerEventType,
    type ClickerEvent,
  } from "../lib/Clicker/ClickerEvent";
  import {
    ClickerTargetStrategyType,
    type ClickerTarget,
  } from "../lib/Clicker/Clicker";

  let activeTab: Tabs.Tab | undefined;
  browser.tabs.query({ active: true }).then((tab) => {
    activeTab = tab[0];
  });

  let status: Record<string, ClickerEvent<ClickerEventType>[]> = {};
  onMessage("clickEmAllEvent", (msg) => {
    const data = msg.data as unknown as ClickerEvent<ClickerEventType>;
    const targetId = data.detail?.target.id;
    if (targetId) {
      status[targetId] = [...(status[targetId] || []), data];
    }
  });

  function clickEmAll() {
    if (!activeTab?.id) {
      return;
    }

    status = {};
    const targets: ClickerTarget[] = [
      {
        name: "Load More Button",
        selector: ".btn.load-more",
        strategy: { type: ClickerTargetStrategyType.whilePresent },
      },
      {
        name: "Clip Coupon Button",
        selector: "[id^=couponAddBtn]",
        strategy: { type: ClickerTargetStrategyType.allFound },
      },
    ];
    sendMessage("clickEmAll", targets as any, `content-script@${activeTab.id}`);
  }
</script>

<main>
  <button
    on:click={() => {
      clickEmAll();
    }}>Click 'em All</button
  >
  <div>
    {#each Object.entries(status) as [_, data]}
      <div>
        <!-- <div>{data[0].detail?.target.name}</div> -->
        {#if data[data.length - 1].type === ClickerEventType.foundElements}
          <div>
            Found {data[data.length - 1].detail?.count} instances of {data[
              data.length - 1
            ].detail?.target.name}
          </div>
        {:else if data[data.length - 1].type === ClickerEventType.maxClicksReached}
          <div>
            Reached max clicks for {data[data.length - 1].detail?.target.name}: {data[
              data.length - 1
            ].detail?.target.strategy.maxClicks}
          </div>
        {:else if data[data.length - 1].type === ClickerEventType.clickedElements}
          <div>
            Clicked {data[data.length - 1].detail?.target.name}
            {data[data.length - 1].detail?.count} times
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <button on:click={openOptionsPage}>Options</button>
</main>

<style>
  main {
    padding: 1rem;
  }
</style>
