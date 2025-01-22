import { randomInt, randomUUID } from 'node:crypto'
import { render, screen } from '@testing-library/svelte'
import ActionSequenceStatusListComponent from '../../../src/lib/components/ActionSequenceStatusList.svelte'
import { formattedTimestamp } from '../../../src/lib/utils/date'
import { ActionSequenceStatusList, ActionSequenceStatusListItem } from '../../../src/lib/types'
import { SequenceRunnerEventType } from '../../../src/lib/SequenceRunner'

describe('components: ActionSequenceStatusList', () => {
  let sequenceName: string
  let targetName: string
  let actionSequenceStatusList: ActionSequenceStatusList

  beforeEach(() => {
    vi.useFakeTimers()

    sequenceName = randomUUID()
    targetName = randomUUID()
    actionSequenceStatusList = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a line item for each status list item provided', () => {
    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: { sequenceName, messageType: SequenceRunnerEventType.beganExecuting }
    })
    vi.advanceTimersByTime(100)

    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: {
        sequenceName,
        targetName,
        messageType: SequenceRunnerEventType.foundElements,
        elementCount: randomInt(999)
      }
    })
    vi.advanceTimersByTime(100)

    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: {
        sequenceName,
        targetName,
        messageType: SequenceRunnerEventType.clickedElements,
        elementCount: randomInt(999)
      }
    })
    vi.advanceTimersByTime(100)

    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: { sequenceName, messageType: SequenceRunnerEventType.finishedExecuting }
    })

    render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

    actionSequenceStatusList.forEach((statusListItem) => {
      expect(
        screen.queryByText(formattedTimestamp(new Date(statusListItem.timestamp)))
      ).toBeInTheDocument()
    })
  })

  it('renders beganExecuting messages', () => {
    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: { sequenceName, messageType: SequenceRunnerEventType.beganExecuting }
    })

    render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

    expect(screen.queryByText('Began running sequence')).toBeInTheDocument()
  })

  describe('when rendering foundElements messages', () => {
    it('renders messages with a count of 0', () => {
      actionSequenceStatusList.push({
        timestamp: new Date().valueOf(),
        detail: {
          sequenceName,
          targetName,
          messageType: SequenceRunnerEventType.foundElements,
          elementCount: 0
        }
      })

      render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

      expect(screen.queryByText(`No elements found for ${targetName}`)).toBeInTheDocument()
    })

    it('renders messages with a count of 1', () => {
      actionSequenceStatusList.push({
        timestamp: new Date().valueOf(),
        detail: {
          sequenceName,
          targetName,
          messageType: SequenceRunnerEventType.foundElements,
          elementCount: 1
        }
      })

      render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

      expect(screen.queryByText(`Found 1 element for ${targetName}`)).toBeInTheDocument()
    })

    it('renders messages with a count more than 1', () => {
      const elementCount = randomInt(2, 999)
      actionSequenceStatusList.push({
        timestamp: new Date().valueOf(),
        detail: {
          sequenceName,
          targetName,
          messageType: SequenceRunnerEventType.foundElements,
          elementCount
        }
      })

      render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

      expect(
        screen.queryByText(`Found ${elementCount} elements for ${targetName}`)
      ).toBeInTheDocument()
    })
  })

  it('renders reachedMaxClicks messages', () => {
    const configuredMaximum = randomInt(2, 999)
    actionSequenceStatusList.push({
      timestamp: new Date().valueOf(),
      detail: {
        sequenceName,
        targetName,
        messageType: SequenceRunnerEventType.reachedMaxClicks,
        configuredMaximum
      }
    })

    render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

    expect(
      screen.queryByText(
        `Reached configured maximum clicks for ${targetName} (${configuredMaximum})`
      )
    ).toBeInTheDocument()
  })

  describe('when rendering clickedElements messages', () => {
    it('renders messages with a count of 1', () => {
      actionSequenceStatusList.push({
        timestamp: new Date().valueOf(),
        detail: {
          sequenceName,
          targetName,
          messageType: SequenceRunnerEventType.clickedElements,
          clickCount: 1
        }
      })

      render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

      expect(screen.queryByText(`Clicked ${targetName} 1 time`)).toBeInTheDocument()
    })

    it('renders messages with a count more than 1', () => {
      const clickCount = randomInt(2, 999)
      actionSequenceStatusList.push({
        timestamp: new Date().valueOf(),
        detail: {
          sequenceName,
          targetName,
          messageType: SequenceRunnerEventType.clickedElements,
          clickCount
        }
      })

      render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

      expect(screen.queryByText(`Clicked ${targetName} ${clickCount} times`)).toBeInTheDocument()
    })
  })

  it('renders error messages', () => {
    const errorMessage: ActionSequenceStatusListItem = {
      timestamp: new Date().valueOf(),
      detail: {
        sequenceName,
        messageType: SequenceRunnerEventType.error,
        error: randomUUID()
      }
    }
    actionSequenceStatusList.push(errorMessage)

    render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

    expect(screen.queryByText('ERROR:')).toBeInTheDocument()
    expect(screen.queryByText(JSON.stringify(errorMessage))).toBeInTheDocument()
  })

  it('renders unrecognized message types', () => {
    const unrecognizedMessage: ActionSequenceStatusListItem = {
      timestamp: new Date().valueOf(),
      detail: {
        sequenceName,
        // @ts-expect-error
        messageType: 'unrecognized'
      }
    }
    actionSequenceStatusList.push(unrecognizedMessage)

    render(ActionSequenceStatusListComponent, { props: { actionSequenceStatusList } })

    expect(screen.queryByText(JSON.stringify(unrecognizedMessage))).toBeInTheDocument()
  })
})
