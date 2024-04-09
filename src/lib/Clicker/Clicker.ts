import { ClickerEvent, ClickerEventType } from "./ClickerEvent";

/** Strategy that can be used for a given `ClickerTarget` */
export enum ClickerTargetStrategyType {
  /** Click all targets immediately once found */
  allFound = "allFound",
  /** Click first element matching target while it is still present on the page */
  whilePresent = "whilePresent",
}

/** Target config that can be acted on by `Clicker` instance */
export interface ClickerTarget {
  /** Name for the selector, e.g. "Load More" */
  name: string;
  /** Selector to use when searchng for matching element(s) on page */
  selector: string;
  /** Strategy to use when clicking matching element(s) */
  strategy: ClickerTargetStrategyType;
  /** Optional max number of clicks to invoke before moving onto the next target */
  maxClicks?: number;
}

/**
 * At runtime, a unique ID is assigned to each target within the currently running
 *   sequence
 */
export interface ClickerTargetWithId extends ClickerTarget {
  id: string;
}

export class Clicker extends EventTarget {
  clickEmAll = async (targets: ClickerTarget[]) => {
    this.dispatchEvent(new ClickerEvent(ClickerEventType.beginClicking));

    const targetsWithIds = targets.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
    }));

    for (const target of targetsWithIds) {
      switch (target.strategy) {
        case ClickerTargetStrategyType.whilePresent: {
          this.#clickElementWhilePresent(target);
          break;
        }

        case ClickerTargetStrategyType.allFound:
        default: {
          this.#clickAllMatchingElements(target);
          break;
        }
      }
    }

    this.dispatchEvent(new ClickerEvent(ClickerEventType.endClicking));
  };

  #clickElementWhilePresent = (target: ClickerTargetWithId) => {
    const { selector, maxClicks = Infinity } = target;
    let count = 0;
    let element: HTMLButtonElement | undefined =
      getFirstMatchingElement(selector);

    while (element && count < maxClicks) {
      element.click();
      count++;
      element = getFirstMatchingElement(selector);
    }

    if (count === maxClicks) {
      this.dispatchEvent(
        new ClickerEvent(ClickerEventType.maxClicksReached, { target })
      );
    }

    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        target,
        count,
      })
    );
  };

  #clickAllMatchingElements = (target: ClickerTargetWithId) => {
    const { selector, maxClicks = Infinity } = target;
    const elements = document.querySelectorAll(
      selector
    ) as NodeListOf<HTMLButtonElement>;
    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.foundElements, {
        target,
        count: elements.length,
      })
    );

    let clickedCount = 0;
    for (const el of elements) {
      if (clickedCount >= maxClicks) {
        this.dispatchEvent(
          new ClickerEvent(ClickerEventType.maxClicksReached, { target })
        );
        break;
      }

      el.click();
      clickedCount++;
    }

    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        target,
        count: clickedCount,
      })
    );
  };
}

function getFirstMatchingElement(selector: string) {
  const matchingElements = document.querySelectorAll(selector);
  const loadMoreButton = matchingElements[0] as HTMLButtonElement | undefined;
  return loadMoreButton;
}
