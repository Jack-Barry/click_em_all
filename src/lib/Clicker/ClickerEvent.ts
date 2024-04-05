/** Event emitted by a `Clicker` instance */
export class ClickerEvent<
  Type extends ClickerEventType = ClickerEventType
> extends CustomEvent<any> {
  constructor(type: Type, data: any) {
    super(type, data);
  }
}

export enum ClickerEventType {
  beginClicking = "beginClicking",
  endClicking = "endClicking",
}
