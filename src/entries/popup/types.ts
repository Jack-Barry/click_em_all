import type { ClickerEventDetail, ClickerEventType } from '../contentScript/primary/Clicker'

export interface ClickSequenceStatusListItem<
  EventType extends ClickerEventType = ClickerEventType
> {
  timestamp: number
  messageType: EventType
  data: ClickerEventDetail<EventType>
}

export type ClickSequenceStatusList = ClickSequenceStatusListItem[]

export type ClickSequenceStatusLists = Record<string, ClickSequenceStatusList>
