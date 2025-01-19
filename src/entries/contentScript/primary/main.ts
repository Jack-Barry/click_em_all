import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { Clicker } from '~/lib/utils/Clicker/Clicker'
import { ClickerEvent, ClickerEventType } from '~/lib/utils/Clicker/ClickerEvent'
import type { ClickTarget } from '~/lib/models/config'

console.log("🏁 Initializing Click 'em All...")

const clicker = new Clicker()

console.debug('Adding event listeners to Clicker')
// Relay clicker events to popup
clicker.addEventListener(ClickerEventType.error, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.error>)
})

clicker.addEventListener(ClickerEventType.beginClicking, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.beginClicking>)
})

clicker.addEventListener(ClickerEventType.foundElements, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.foundElements>)
})

clicker.addEventListener(ClickerEventType.maxClicksReached, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.maxClicksReached>)
})

clicker.addEventListener(ClickerEventType.clickedElements, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.clickedElements>)
})

clicker.addEventListener(ClickerEventType.endClicking, (e) => {
  sendClickEmAllEventToPopup(e as ClickerEvent<ClickerEventType.endClicking>)
})

// Respond to request from popup to "click 'em all"
onMessage('clickEmAll', (msg) => {
  console.debug('Received clickEmAll message', msg)
  console.log("🔨 Clickin' 'em all")
  clicker.clickEmAll(msg.data as ClickTarget[])
})

function sendClickEmAllEventToPopup(event: ClickerEvent<ClickerEventType>) {
  console.debug(`Sending event to popup`, event)
  sendMessage('clickEmAllEvent', { type: event.type, detail: event.detail }, 'popup')
}

console.log("Click 'em All Initialized 🤘")
