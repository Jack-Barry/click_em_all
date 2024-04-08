import type { ClickerTargetWithId } from "./Clicker";

/** Event emitted by a `Clicker` instance */
export class ClickerEvent<
  Type extends ClickerEventType = ClickerEventType
> extends CustomEvent<ClickerEventDetail<Type>> {
  constructor(type: Type, data?: ClickerEventDetail<Type>) {
    super(type, { detail: data });
  }
}

export enum ClickerEventType {
  beginClicking = "beginClicking",
  foundElements = "foundElements",
  maxClicksReached = "maxClicksReached",
  clickedElements = "clickedElements",
  endClicking = "endClicking",
}

export type ClickerEventDetail<Type extends ClickerEventType> = Type extends
  | ClickerEventType.beginClicking
  | ClickerEventType.endClicking
  ? undefined
  : Type extends ClickerEventType.maxClicksReached
  ? { target: ClickerTargetWithId; count?: undefined }
  : Type extends
      | ClickerEventType.foundElements
      | ClickerEventType.clickedElements
  ? { target: ClickerTargetWithId; count: number }
  : any;
