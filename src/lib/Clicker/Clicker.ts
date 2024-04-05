import { ClickerEvent, ClickerEventType } from "./ClickerEvent";

export class Clicker extends EventTarget {
  clickEmAll = async () => {
    this.dispatchEvent(new ClickerEvent(ClickerEventType.beginClicking, {}));
    console.log("Clickin' away");
    this.dispatchEvent(new ClickerEvent(ClickerEventType.endClicking, {}));
  };
}
