import { ClickerTargetStrategyType, type ClickTarget } from '../../models/config'
import { ClickerEvent, ClickerEventType } from './ClickerEvent'

export class Clicker extends EventTarget {
  constructor() {
    super()
  }

  clickEmAll = (clickTargets: ClickTarget[]) => {
    this.logAndDispatchEvent(new ClickerEvent(ClickerEventType.beginClicking))

    try {
      for (const clickTarget of clickTargets) {
        console.debug(`Using ${clickTarget.strategy} strategy for ${clickTarget.name}`)
        switch (clickTarget.strategy) {
          case ClickerTargetStrategyType.whilePresent: {
            this.clickElementWhilePresent(clickTarget)
            break
          }

          case ClickerTargetStrategyType.allFound:
          default: {
            this.clickAllMatchingElements(clickTarget)
            break
          }
        }
      }
    } catch (e) {
      // TODO: ensure the error includes target to pass through for easier
      // troubleshooting
      console.debug('Encountered an error', e)
      this.logAndDispatchEvent(new ClickerEvent(ClickerEventType.error, e))
    }

    this.logAndDispatchEvent(new ClickerEvent(ClickerEventType.endClicking))
  }

  private clickElementWhilePresent = (clickTarget: ClickTarget) => {
    const { selector, maxClicks = Infinity } = clickTarget
    let count = 0
    let element = document.querySelector(selector)

    while (element && count < maxClicks) {
      this.assertElementIsClickable(element)
      element.click()
      count++
      element = document.querySelector(selector)
    }

    if (count === maxClicks) {
      this.logAndDispatchEvent(new ClickerEvent(ClickerEventType.maxClicksReached, { clickTarget }))
    }

    this.logAndDispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        clickTarget,
        count
      })
    )
  }

  private clickAllMatchingElements = (clickTarget: ClickTarget) => {
    const { selector, maxClicks = Infinity } = clickTarget
    const elements = document.querySelectorAll(selector)
    this.logAndDispatchEvent(
      new ClickerEvent(ClickerEventType.foundElements, {
        clickTarget,
        count: elements.length
      })
    )

    let clickedCount = 0
    for (const element of elements) {
      this.assertElementIsClickable(element)

      console.debug('Clicking element', element)
      if (clickedCount >= maxClicks) {
        this.logAndDispatchEvent(
          new ClickerEvent(ClickerEventType.maxClicksReached, { clickTarget })
        )
        break
      }

      element.click()
      clickedCount++
    }

    this.logAndDispatchEvent(
      new ClickerEvent(ClickerEventType.clickedElements, {
        clickTarget,
        count: clickedCount
      })
    )
  }

  private assertElementIsClickable(element: Element): asserts element is HTMLElement {
    if (!(element as HTMLElement).click) {
      throw new Error(`element has no click method: ${element.getHTML()}`)
    }
  }

  private logAndDispatchEvent = (event: Event) => {
    console.debug(`Dispatching event with type: "${event.type}"`, event)
    this.dispatchEvent(event)
    console.debug('Event successfully dispatched')
  }
}
