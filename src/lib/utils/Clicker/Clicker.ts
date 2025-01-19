import { ClickerTargetStrategyType, type ClickTarget } from '../../models/config'
import { ClickerEvent, ClickerEventType } from './ClickerEvent'

export class Clicker extends EventTarget {
  clickEmAll = async (targets: ClickTarget[]) => {
    this.dispatchEvent(new ClickerEvent(ClickerEventType.beginClicking))

    try {
      for (const target of targets) {
        switch (target.strategy) {
          case ClickerTargetStrategyType.whilePresent: {
            this.clickElementWhilePresent(target)
            break
          }

          case ClickerTargetStrategyType.allFound:
          default: {
            this.clickAllMatchingElements(target)
            break
          }
        }
      }
    } catch (e) {
      this.dispatchEvent(new ClickerEvent(ClickerEventType.error, e))
      throw e
    }

    this.dispatchEvent(new ClickerEvent(ClickerEventType.endClicking))
  }

  private clickElementWhilePresent(target: ClickTarget) {
    const { selector, maxClicks = Infinity } = target
    let count = 0
    let element: HTMLElement | null = document.querySelector(selector)

    while (element && count < maxClicks) {
      element.click()
      count++
      element = document.querySelector(selector)
    }

    if (count === maxClicks) {
      this.dispatchEvent(new ClickerEvent(ClickerEventType.maxClicksReached, { target }))
    }

    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        target,
        count
      })
    )
  }

  private clickAllMatchingElements(target: ClickTarget) {
    const { selector, maxClicks = Infinity } = target
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>
    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.foundElements, {
        target,
        count: elements.length
      })
    )

    let clickedCount = 0
    for (const element of elements) {
      if (clickedCount >= maxClicks) {
        this.dispatchEvent(new ClickerEvent(ClickerEventType.maxClicksReached, { target }))
        break
      }

      element.click()
      clickedCount++
    }

    this.dispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        target,
        count: clickedCount
      })
    )
  }
}
