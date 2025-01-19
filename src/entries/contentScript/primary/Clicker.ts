import type { ClickSequence } from '~/lib/models/config'
import { Logging } from '~/lib/utils/logging'

class ClickerEventTarget extends window.EventTarget {}

export enum ClickerEventType {
  error = 'error',
  beganClicking = 'beganClicking',
  finishedClicking = 'finishedClicking'
}

export type ClickerEventDetail<Type extends ClickerEventType = ClickerEventType> = {
  sequenceName: string
} & (Type extends ClickerEventType.error ? { error: unknown } : {})
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

    Clicker.sendMessage(
      new ClickerEvent(ClickerEventType.finishedClicking, { sequenceName: sequence.name })
    )
  }
}
