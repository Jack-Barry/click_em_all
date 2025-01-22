import { SequenceRunnerEventDetail, SequenceRunnerEventType } from './SequenceRunner'

export interface ActionSequenceStatusListItem<
  EventType extends SequenceRunnerEventType = SequenceRunnerEventType
> {
  timestamp: number
  detail: SequenceRunnerEventDetail<EventType>
}

export type ActionSequenceStatusList = ActionSequenceStatusListItem[]

export type ActionSequenceStatusLists = Record<string, ActionSequenceStatusList>
