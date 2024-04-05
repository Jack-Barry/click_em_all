import { onMessage } from "webext-bridge/content-script";

console.log("Initializing Click 'em All...");

onMessage("clickEmAll", async (message) => {
  console.log("Messaged received", message);
  console.log("🔨 Proceeding to click 'em all");
});

console.log("Click 'em All Initialized 🤘");
