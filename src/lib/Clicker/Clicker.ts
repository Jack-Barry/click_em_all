import { ClickerEvent, ClickerEventType } from "./ClickerEvent";

export enum ClickerTargetStrategyType {
  allFound = "allFound",
  whilePresent = "whilePresent",
}

interface ClickerTargetStrategy {
  type: ClickerTargetStrategyType;
  maxClicks?: number;
}

export interface ClickerTarget {
  selector: string;
  name?: string;
  strategy: ClickerTargetStrategy;
}

export interface ClickerTargetWithId extends ClickerTarget {
  id: string;
  name: string;
}

export class Clicker extends EventTarget {
  clickEmAll = async (targets: ClickerTarget[]) => {
    this.dispatchEvent(new ClickerEvent(ClickerEventType.beginClicking));

    for (const target of targets.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      name: t.name || t.selector,
    }))) {
      switch (target.strategy.type) {
        case ClickerTargetStrategyType.whilePresent: {
          this.#clickButtonWhilePresent(target);
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

  #clickButtonWhilePresent = (target: ClickerTargetWithId) => {
    const { selector, strategy } = target;
    const { maxClicks = Infinity } = strategy;
    let count = 0;
    let loadMoreButton: HTMLButtonElement | undefined = getButton(selector);

    while (loadMoreButton && count < maxClicks) {
      loadMoreButton.click();
      count++;
      loadMoreButton = getButton(selector);
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
    const { selector, strategy } = target;
    const { maxClicks = Infinity } = strategy;
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

      // el.click();
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

function getButton(selector: string) {
  const loadMoreButtons = document.querySelectorAll(selector);
  const loadMoreButton = loadMoreButtons[0] as HTMLButtonElement | undefined;
  return loadMoreButton;
}
