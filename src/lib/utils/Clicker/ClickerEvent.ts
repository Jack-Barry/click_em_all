import type { ClickTarget } from '~/lib/models/config'

export class ClickerEvent<Type extends ClickerEventType = ClickerEventType> extends CustomEvent<
  ClickerEventDetail<Type>
> {
  constructor(type: Type, data?: ClickerEventDetail<Type>) {
    super(type, { detail: data })
  }
}

export enum ClickerEventType {
  error = 'error',
  beginClicking = 'beginClicking',
  foundElements = 'foundElements',
  maxClicksReached = 'maxClicksReached',
  clickedElements = 'clickedElements',
  endClicking = 'endClicking'
}

export type ClickerEventDetail<Type extends ClickerEventType> = Type extends
  | ClickerEventType.beginClicking
  | ClickerEventType.endClicking
  ? undefined
  : Type extends ClickerEventType.maxClicksReached
    ? { clickTarget: ClickTarget }
    : Type extends ClickerEventType.foundElements | ClickerEventType.clickedElements
      ? { clickTarget: ClickTarget; count: number }
      : any
