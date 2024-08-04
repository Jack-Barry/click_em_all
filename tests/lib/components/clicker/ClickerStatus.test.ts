import { render, screen } from "@testing-library/svelte";
import * as webextBridge from "webext-bridge/popup";

import type { ClickerTargetWithId } from "../../../../src/lib/Clicker/Clicker";
import {
  ClickerEvent,
  ClickerEventType,
} from "../../../../src/lib/Clicker/ClickerEvent";
import { ClickerTargetStrategyType } from "../../../../src/lib/Clicker/schemas";
import ClickerStatus from "../../../../src/lib/components/clicker/ClickerStatus.svelte";

describe("Popup: ClickerStatus", () => {
  let props: {
    onMessage: typeof webextBridge.onMessage;
    statuses: Record<string, ClickerEvent<ClickerEventType>[]>;
  };

  beforeEach(() => {
    props = { onMessage: webextBridge.onMessage, statuses: {} };
  });

  test("presents latest status for each target in the currently active sequence", () => {
    const targetA: ClickerTargetWithId = {
      id: "target_a",
      name: "Target A",
      selector: ".a",
      strategy: ClickerTargetStrategyType.whilePresent,
    };
    const targetB: ClickerTargetWithId = {
      id: "target_b",
      name: "Target B",
      selector: ".b",
      strategy: ClickerTargetStrategyType.allFound,
      maxClicks: 2,
    };
    const targetC: ClickerTargetWithId = {
      id: "target_c",
      name: "Target C",
      selector: ".c",
      strategy: ClickerTargetStrategyType.allFound,
    };
    props.statuses = {
      [targetA.id]: [
        new ClickerEvent(ClickerEventType.clickedElements, {
          count: 1,
          target: targetA,
        }),
      ],
      [targetB.id]: [
        new ClickerEvent(ClickerEventType.clickedElements, {
          count: 2,
          target: targetB,
        }),
        new ClickerEvent(ClickerEventType.maxClicksReached, {
          target: targetB,
        }),
      ],
      [targetC.id]: [
        new ClickerEvent(ClickerEventType.foundElements, {
          count: 3,
          target: targetC,
        }),
      ],
    };
    render(ClickerStatus, props);
    expect(screen.getByText(`Clicked "${targetA.name}" 1 times`));
    expect(
      screen.getByText(
        `Reached max clicks for "${targetB.name}": ${targetB.maxClicks}`
      )
    );
    expect(screen.getByText(`Found 3 instances of "${targetC.name}"`));
  });

  describe("clickEmAllEvent handler", () => {
    describe("when message with error is received", () => {
      test.skip("errors are rendered", () => {});
    });

    describe("when message with target ID is received", () => {
      test.skip("renders statuses as they are received", () => {});
    });
  });
});
