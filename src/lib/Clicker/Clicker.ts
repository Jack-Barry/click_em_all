import { z } from "zod";
import { ClickerEvent, ClickerEventType } from "./ClickerEvent";
import { ClickerTargetStrategyType, clickerTargetSchema } from "./schemas";

/** Target config that can be acted on by `Clicker` instance */
export type ClickerTarget = z.infer<typeof clickerTargetSchema>;

const clickerTargetWithIdSchema = clickerTargetSchema.extend({
  /** ID assigned to the target at run time */
  id: z.string({}),
});

/**
 * At runtime, a unique ID is assigned to each target within the currently running
 *   sequence
 */
export type ClickerTargetWithId = z.infer<typeof clickerTargetWithIdSchema>;

export class Clicker extends EventTarget {
  clickEmAll = async (targets: ClickerTarget[]) => {
    this.dispatchEvent(new ClickerEvent(ClickerEventType.beginClicking));

    try {
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
    } catch (e) {
      this.dispatchEvent(new ClickerEvent(ClickerEventType.error, e));
      throw e;
    }

    this.dispatchEvent(new ClickerEvent(ClickerEventType.endClicking));
  };

  #clickElementWhilePresent = (target: ClickerTargetWithId) => {
    const { selector, maxClicks = Infinity } = target;
    let count = 0;
    let element: HTMLElement | null = document.querySelector(selector);

    while (element && count < maxClicks) {
      element.click();
      count++;
      element = document.querySelector(selector);
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
    ) as NodeListOf<HTMLElement>;
    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.foundElements, {
        target,
        count: elements.length,
      })
    );

    let clickedCount = 0;
    for (const element of elements) {
      if (clickedCount >= maxClicks) {
        this.dispatchEvent(
          new ClickerEvent(ClickerEventType.maxClicksReached, { target })
        );
        break;
      }

      element.click();
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
