import {
  ClickerTargetStrategyType,
  type ClickSequence,
  type ClickTarget
} from '~/lib/models/config'
import { Logging } from '~/lib/utils/logging'
import { pause } from '~/lib/utils/pause'

class ClickerEventTarget extends window.EventTarget {}

export enum ClickerEventType {
  error = 'error',
  beganClicking = 'beganClicking',
  foundElements = 'foundElements',
  reachedMaxClicks = 'reachedMaxClicks',
  clickedElements = 'clickedElements',
  finishedClicking = 'finishedClicking'
}

interface ClickerEventDetailWithTargetName {
  targetName: string
}
export type ClickerEventDetail<Type extends ClickerEventType = ClickerEventType> = {
  sequenceName: string
} & (Type extends ClickerEventType.error
  ? { error: string }
  : Type extends ClickerEventType.foundElements
    ? ClickerEventDetailWithTargetName & { elementCount: number }
    : Type extends ClickerEventType.reachedMaxClicks
      ? ClickerEventDetailWithTargetName & { configuredMaximium: number }
      : Type extends ClickerEventType.clickedElements
        ? ClickerEventDetailWithTargetName & { clickCount: number }
        : {})

/** Event emitted by `Clicker` */
export class ClickerEvent<Type extends ClickerEventType = ClickerEventType> extends CustomEvent<
  ClickerEventDetail<Type>
> {
  constructor(type: Type, data: ClickerEventDetail<Type>) {
    super(type, { detail: data })
  }
}

type ClickerEventListener<Type extends ClickerEventType = ClickerEventType> = (
  event: ClickerEvent<Type>
) => void | Promise<void>

export class Clicker {
  private static instance: Clicker
  private static eventTarget = new ClickerEventTarget()
  private static listeners: Record<string, ClickerEventListener> = {}

  private constructor() {}

  static getInstance() {
    if (!Clicker.instance) {
      Clicker.instance = new Clicker()
    }

    return Clicker.instance
  }

  protected destroy() {
    // @ts-expect-error
    Clicker.instance = null
  }

  private static makeId(idSuffix: string, eventType: ClickerEventType) {
    return `${eventType}${idSuffix}`
  }

  static addListener<EventType extends ClickerEventType>(
    eventType: EventType,
    listener: ClickerEventListener<EventType>,
    idSuffix = ''
  ) {
    const id = this.makeId(idSuffix, eventType)
    if (Clicker.listeners[id] !== undefined) {
      return
    }

    Clicker.listeners[id] = listener
    Clicker.eventTarget.addEventListener(eventType, listener as EventListener)
  }

  static removeListener(eventType: ClickerEventType, idSuffix: string) {
    const id = this.makeId(idSuffix, eventType)
    const listener = Clicker.listeners[id]
    if (listener === undefined) {
      return
    }

    Clicker.eventTarget.removeEventListener(id, listener as EventListener)
  }

  static listListeners() {
    return Object.keys(Clicker.listeners)
  }

  private static sendMessage<Type extends ClickerEventType>(message: ClickerEvent<Type>) {
    Clicker.eventTarget.dispatchEvent(message)
  }

  async executeClickSequence(sequence: ClickSequence) {
    Logging.debug('Executing click sequence', sequence)

    Clicker.sendMessage(
      new ClickerEvent(ClickerEventType.beganClicking, { sequenceName: sequence.name })
    )

    for (const target of sequence.targets) {
      try {
        await this.handleTarget(sequence.name, target)
      } catch (error) {
        Logging.error(JSON.stringify(error), error)
        Clicker.sendMessage(
          new ClickerEvent(ClickerEventType.error, {
            sequenceName: sequence.name,
            error: (error as Error).message ?? 'unknown'
          })
        )
      }
    }

    Clicker.sendMessage(
      new ClickerEvent(ClickerEventType.finishedClicking, { sequenceName: sequence.name })
    )
  }

  private async handleTarget(sequenceName: string, target: ClickTarget) {
    Logging.debug(`Handling target: ${target.name} for sequence: ${sequenceName}`, target)
    const targetOptions: Required<ClickTarget> = {
      timeBetweenMs: 0,
      maxClicks: 1000,
      ...target
    }

    // treat 0 maxClicks as "unlimited"
    if (targetOptions.maxClicks === 0) {
      targetOptions.maxClicks = Infinity
    }

    switch (target.strategy) {
      case ClickerTargetStrategyType.allFound: {
        await this.clickAllFound(sequenceName, targetOptions)
        break
      }
      case ClickerTargetStrategyType.whilePresent: {
        await this.clickWhilePresent(sequenceName, targetOptions)
        break
      }
      default: {
        throw new Error(`unrecognized strategy: ${target.strategy}`)
      }
    }
  }

  private async clickAllFound(sequenceName: string, target: Required<ClickTarget>) {
    const elements = document.querySelectorAll(target.selector)
    Clicker.sendMessage(
      new ClickerEvent(ClickerEventType.foundElements, {
        sequenceName,
        targetName: target.name,
        elementCount: elements.length
      })
    )

    let clickCount = 0
    for (const element of elements) {
      if (clickCount >= target.maxClicks) {
        Clicker.sendMessage(
          new ClickerEvent(ClickerEventType.reachedMaxClicks, {
            sequenceName,
            targetName: target.name,
            configuredMaximium: target.maxClicks
          })
        )
        break
      }

      this.assertElementIsClickable(target.selector, element)
      element.click()
      clickCount++
      await pause(target.timeBetweenMs)
    }

    if (clickCount > 0) {
      Clicker.sendMessage(
        new ClickerEvent(ClickerEventType.clickedElements, {
          sequenceName,
          targetName: target.name,
          clickCount
        })
      )
    }
  }

  private async clickWhilePresent(sequenceName: string, target: Required<ClickTarget>) {
    let clickCount = 0
    let element = document.querySelector(target.selector)

    while (element && clickCount < target.maxClicks) {
      this.assertElementIsClickable(target.selector, element)
      element.click()
      clickCount++
      await pause(target.timeBetweenMs)
      element = document.querySelector(target.selector)
    }

    if (clickCount === target.maxClicks) {
      Clicker.sendMessage(
        new ClickerEvent(ClickerEventType.reachedMaxClicks, {
          sequenceName,
          targetName: target.name,
          configuredMaximium: target.maxClicks
        })
      )
    }

    if (clickCount > 0) {
      Clicker.sendMessage(
        new ClickerEvent(ClickerEventType.clickedElements, {
          sequenceName,
          targetName: target.name,
          clickCount
        })
      )
    }
  }

  private assertElementIsClickable(
    selector: string,
    element: Element | null
  ): asserts element is HTMLElement {
    if (!element) {
      throw new Error(`unable to find element using selector: ${selector}`)
    }

    if ((element as HTMLElement).click === undefined) {
      throw new Error(`element for selector ${selector} is not clickable: ${element.getHTML()}`)
    }
  }
}
