import { onMessage, sendMessage } from "webext-bridge/content-script";
import { Clicker } from "../../lib/Clicker/Clicker";
import { ClickerEvent, ClickerEventType } from "../../lib/Clicker/ClickerEvent";

console.log("Initializing Click 'em All...");
const clicker = new Clicker();
clicker.addEventListener(ClickerEventType.beginClicking, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.beginClicking>);
});

clicker.addEventListener(ClickerEventType.endClicking, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.endClicking>);
});

onMessage("clickEmAll", async (message) => {
  console.log("Messaged received", message);
  console.log("🔨 Proceeding to click 'em all");
  await clicker.clickEmAll();
});

console.log("Click 'em All Initialized 🤘");

function sendClickEmAllEventToPopup(event: ClickerEvent<ClickerEventType>) {
  sendMessage(
    "clickEmAllEvent",
    { type: event.type, detail: event.detail },
    "popup"
  );
}
