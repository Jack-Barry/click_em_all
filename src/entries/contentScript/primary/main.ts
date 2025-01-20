import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { Logging } from '~/lib/utils/logging'
import { Clicker, ClickerEvent, ClickerEventType } from './Clicker'
import type { ClickSequence } from '~/lib/models/config'
import { IpcMessageIds } from '~/lib/constants'

Logging.info('🏁 Initializing...')
const clicker = Clicker.getInstance()

Clicker.addListener(ClickerEventType.error, handleEvent)
Clicker.addListener(ClickerEventType.beganClicking, handleEvent)
Clicker.addListener(ClickerEventType.foundElements, handleEvent)
Clicker.addListener(ClickerEventType.reachedMaxClicks, handleEvent)
Clicker.addListener(ClickerEventType.clickedElements, handleEvent)
Clicker.addListener(ClickerEventType.finishedClicking, handleEvent)

Logging.debug(`Clicker currently registered listeners: ${Clicker.listListeners().join(', ')}`)

Logging.debug(`Adding message listener for ${IpcMessageIds.executeClickSequence}`)
onMessage(IpcMessageIds.executeClickSequence, (msg) => {
  clicker.executeClickSequence(msg.data as ClickSequence)
})

async function handleEvent<EventType extends ClickerEventType>(event: ClickerEvent<EventType>) {
  Logging.debug(`Handling eventType: ${event.type}, detail:`, event.detail)
  await sendMessage(event.type, event.detail as Parameters<typeof sendMessage>[1], 'popup')
}

Logging.info('Initialization complete 🤘')
