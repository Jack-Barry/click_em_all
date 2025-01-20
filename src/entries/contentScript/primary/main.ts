import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { Logging } from '~/lib/utils/Logging'
import { SequenceRunner } from './SequenceRunner'
import type { ActionSequence } from '~/lib/models/config'
import { IpcMessageIds } from '~/lib/constants'

Logging.info('🏁 Initializing...')

SequenceRunner.addListener('content-script', async (event) => {
  Logging.debug(`Handling eventType: ${event.type}, detail:`, event.detail)
  await sendMessage(event.type, event.detail as Parameters<typeof sendMessage>[1], 'popup')
})

Logging.debug(
  `SequenceRunner currently registered listeners: ${SequenceRunner.listListeners().join(', ')}`
)

Logging.debug(`Adding message listener for ${IpcMessageIds.executeSequence}`)
onMessage(IpcMessageIds.executeSequence, (msg) => {
  SequenceRunner.executeSequence(msg.data as ActionSequence)
})

Logging.info('Initialization complete 🤘')
