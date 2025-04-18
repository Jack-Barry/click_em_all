import { ActionSequence, ActionTargetStrategyType, SequenceActionTarget } from './models/config'
import { Logging } from './utils/Logging'
import { pause } from './utils/pause'

export enum SequenceRunnerEventType {
  error = 'error',
  beganExecuting = 'beganExecuting',
  foundElements = 'foundElements',
  reachedMaxClicks = 'reachedMaxClicks',
  clickedElements = 'clickedElements',
  finishedExecuting = 'finishedExecuting'
}

export type SequenceRunnerEventTypeWithTargetName =
  | SequenceRunnerEventType.foundElements
  | SequenceRunnerEventType.reachedMaxClicks
  | SequenceRunnerEventType.clickedElements

interface SequenceRunnerEventDetailWithTargetName {
  targetName: string
}

interface SequenceRunnerEventDetailForError {
  error: string
}

interface SequenceRunnerEventDetailForFoundElements {
  elementCount: number
}

interface SequenceRunnerEventDetailForReachedMaxClicks {
  configuredMaximum: number
}

interface SequenceRunnerEventDetailForClickedElements {
  clickCount: number
}

export type SequenceRunnerEventDetail<
  Type extends SequenceRunnerEventType = SequenceRunnerEventType
> = {
  messageType: Type
  sequenceName: string
} & (Type extends SequenceRunnerEventTypeWithTargetName
  ? SequenceRunnerEventDetailWithTargetName
  : {}) &
  (Type extends SequenceRunnerEventType.error
    ? SequenceRunnerEventDetailForError
    : Type extends SequenceRunnerEventType.foundElements
      ? SequenceRunnerEventDetailForFoundElements
      : Type extends SequenceRunnerEventType.reachedMaxClicks
        ? SequenceRunnerEventDetailForReachedMaxClicks
        : Type extends SequenceRunnerEventType.clickedElements
          ? SequenceRunnerEventDetailForClickedElements
          : {})

/**
 * Convenience type to make it easier to grab properties when it's known that
 * a value is _some_ kind of `SequenceRunnerEventDetail`
 */
export type SomeSequenceRunnerEventDetail = Partial<
  SequenceRunnerEventDetailWithTargetName &
    SequenceRunnerEventDetailForError &
    SequenceRunnerEventDetailForFoundElements &
    SequenceRunnerEventDetailForReachedMaxClicks &
    SequenceRunnerEventDetailForClickedElements
>

export const SEQUENCE_RUNNER_EMITTED_EVENT_TYPE = 'clickEmAllClicker'

/** Event emitted by `SequenceRunner` */
export class SequenceRunnerEvent<
  Type extends SequenceRunnerEventType = SequenceRunnerEventType
> extends CustomEvent<SequenceRunnerEventDetail<Type>> {
  constructor(data: SequenceRunnerEventDetail<Type>) {
    super(SEQUENCE_RUNNER_EMITTED_EVENT_TYPE, { detail: data })
  }
}

type SequenceRunnerEventListener<Type extends SequenceRunnerEventType = SequenceRunnerEventType> = (
  event: SequenceRunnerEvent<Type>
) => void | Promise<void>

export class SequenceRunner {
  private static eventTarget = new window.EventTarget()
  private static listeners: Record<string, SequenceRunnerEventListener> = {}

  /* v8 ignore next */
  private constructor() {}

  /** **For unit test purposes _ONLY_** */
  protected static reset() {
    Object.keys(SequenceRunner.listeners).forEach((listenerId) => {
      SequenceRunner.removeListener(listenerId)
    })
  }

  static addListener<EventType extends SequenceRunnerEventType>(
    id: string,
    listener: SequenceRunnerEventListener<EventType>
  ) {
    if (SequenceRunner.listeners[id] !== undefined) {
      return
    }

    SequenceRunner.listeners[id] = listener as SequenceRunnerEventListener
    SequenceRunner.eventTarget.addEventListener(
      SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
      listener as EventListener
    )
  }

  static removeListener(id: string) {
    const listener = SequenceRunner.listeners[id]
    if (listener === undefined) {
      return
    }

    SequenceRunner.eventTarget.removeEventListener(
      SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
      listener as EventListener
    )
    delete SequenceRunner.listeners[id]
  }

  static listListeners() {
    return Object.keys(SequenceRunner.listeners)
  }

  static async executeSequence(sequence: ActionSequence) {
    Logging.debug('Executing click sequence', sequence)

    SequenceRunner.sendMessage(
      new SequenceRunnerEvent({
        messageType: SequenceRunnerEventType.beganExecuting,
        sequenceName: sequence.name
      })
    )

    for (const target of sequence.targets) {
      try {
        await SequenceRunner.handleTarget(sequence.name, target)
      } catch (error) {
        Logging.error(JSON.stringify(error), error)
        SequenceRunner.sendMessage(
          new SequenceRunnerEvent({
            messageType: SequenceRunnerEventType.error,
            sequenceName: sequence.name,
            error: (error as Error).message ?? 'unknown'
          })
        )
      }
    }

    SequenceRunner.sendMessage(
      new SequenceRunnerEvent({
        messageType: SequenceRunnerEventType.finishedExecuting,
        sequenceName: sequence.name
      })
    )
  }

  private static async handleTarget(sequenceName: string, target: SequenceActionTarget) {
    Logging.debug(`Handling target: ${target.name} for sequence: ${sequenceName}`, target)
    const targetOptions: Required<SequenceActionTarget> = {
      timeBetweenMs: 0,
      maxClicks: 1000,
      ...target
    }

    // treat negative number of maxClicks as "unlimited"
    if (targetOptions.maxClicks < 0) {
      targetOptions.maxClicks = Infinity
    }

    switch (target.strategy) {
      case ActionTargetStrategyType.clickAllFound: {
        await SequenceRunner.clickAllFound(sequenceName, targetOptions)
        break
      }
      case ActionTargetStrategyType.clickWhilePresent: {
        await SequenceRunner.clickWhilePresent(sequenceName, targetOptions)
        break
      }
      default: {
        throw new Error(`unrecognized strategy: ${target.strategy}`)
      }
    }
  }

  private static async clickAllFound(sequenceName: string, target: Required<SequenceActionTarget>) {
    const elements = document.querySelectorAll(target.selector)
    SequenceRunner.sendMessage(
      new SequenceRunnerEvent({
        messageType: SequenceRunnerEventType.foundElements,
        sequenceName,
        targetName: target.name,
        elementCount: elements.length
      })
    )

    let clickCount = 0
    for (const element of elements) {
      if (clickCount >= target.maxClicks) {
        SequenceRunner.sendMessage(
          new SequenceRunnerEvent({
            messageType: SequenceRunnerEventType.reachedMaxClicks,
            sequenceName,
            targetName: target.name,
            configuredMaximum: target.maxClicks
          })
        )
        break
      }

      SequenceRunner.assertElementIsClickable(target.selector, element)
      element.click()
      clickCount++
      await pause(target.timeBetweenMs)
    }

    if (clickCount > 0) {
      SequenceRunner.sendMessage(
        new SequenceRunnerEvent({
          messageType: SequenceRunnerEventType.clickedElements,
          sequenceName,
          targetName: target.name,
          clickCount
        })
      )
    }
  }

  private static async clickWhilePresent(
    sequenceName: string,
    target: Required<SequenceActionTarget>
  ) {
    let clickCount = 0
    let element = document.querySelector(target.selector)

    while (element && clickCount < target.maxClicks) {
      SequenceRunner.assertElementIsClickable(target.selector, element)
      element.click()
      clickCount++
      await pause(target.timeBetweenMs)
      element = document.querySelector(target.selector)
    }

    if (clickCount === target.maxClicks) {
      SequenceRunner.sendMessage(
        new SequenceRunnerEvent({
          messageType: SequenceRunnerEventType.reachedMaxClicks,
          sequenceName,
          targetName: target.name,
          configuredMaximum: target.maxClicks
        })
      )
    }

    if (clickCount > 0) {
      SequenceRunner.sendMessage(
        new SequenceRunnerEvent({
          messageType: SequenceRunnerEventType.clickedElements,
          sequenceName,
          targetName: target.name,
          clickCount
        })
      )
    }
  }

  private static sendMessage<Type extends SequenceRunnerEventType>(
    message: SequenceRunnerEvent<Type>
  ) {
    SequenceRunner.eventTarget.dispatchEvent(message)
  }

  private static assertElementIsClickable(
    selector: string,
    element: Element
  ): asserts element is HTMLElement {
    if ((element as HTMLElement).click === undefined) {
      throw new Error(`element for selector ${selector} is not clickable: ${element.getHTML()}`)
    }
  }
}
