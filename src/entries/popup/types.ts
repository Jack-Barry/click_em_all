import type { ClickerEventDetail, ClickerEventType } from '../contentScript/primary/Clicker'

export type ClickSequenceStatusList = {
  timestamp: number
  messageType: ClickerEventType
  data: ClickerEventDetail
}[]

export type ClickSequenceStatusLists = Record<string, ClickSequenceStatusList>
