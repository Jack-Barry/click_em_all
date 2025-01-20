import type {
  SequenceRunnerEventDetail,
  SequenceRunnerEventType
} from '../contentScript/primary/SequenceRunner'

export interface ActionSequenceStatusListItem<
  EventType extends SequenceRunnerEventType = SequenceRunnerEventType
> {
  timestamp: number
  detail: SequenceRunnerEventDetail<EventType>
}

export type ActionSequenceStatusList = ActionSequenceStatusListItem[]

export type ActionSequenceStatusLists = Record<string, ActionSequenceStatusList>
