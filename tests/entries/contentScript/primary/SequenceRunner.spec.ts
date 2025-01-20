import { randomUUID } from 'node:crypto'
import {
  SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
  SequenceRunner,
  SequenceRunnerEvent,
  SequenceRunnerEventType
} from '../../../../src/entries/contentScript/primary/SequenceRunner'

describe('contentScript: SequenceRunner', () => {
  afterEach(() => {
    SequenceRunner['reset']()
  })

  describe('addListener', () => {
    const addEventListenerSpy = vi.spyOn(window.EventTarget.prototype, 'addEventListener')
    const listener = vi.fn()
    let listenerId: string

    beforeEach(() => {
      listenerId = randomUUID()
    })

    it('registers a listener with the provided ID', () => {
      SequenceRunner.addListener(listenerId, listener)
      expect(SequenceRunner['listeners']).toStrictEqual({ [listenerId]: listener })
    })

    it('adds a listener to the attached EventTarget', () => {
      SequenceRunner.addListener(listenerId, listener)
      expect(addEventListenerSpy).toHaveBeenCalledExactlyOnceWith(
        SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
        listener
      )
    })

    it('does nothing when a listener with the same ID is already registered', () => {
      SequenceRunner.addListener(listenerId, listener)
      addEventListenerSpy.mockReset()
      expect(addEventListenerSpy).not.toHaveBeenCalled()

      SequenceRunner.addListener(listenerId, listener)
      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })
  })

  describe('removeListener', () => {
    const removeEventListenerSpy = vi.spyOn(window.EventTarget.prototype, 'removeEventListener')
    const listener = vi.fn()
    let listenerId1: string
    let listenerId2: string

    beforeEach(() => {
      listenerId1 = randomUUID()
      listenerId2 = randomUUID()
      SequenceRunner.addListener(listenerId1, listener)
      SequenceRunner.addListener(listenerId2, listener)
    })

    it('removes listener with matching ID', () => {
      expect(SequenceRunner['listeners']).toStrictEqual({
        [listenerId1]: listener,
        [listenerId2]: listener
      })
      SequenceRunner.removeListener(listenerId1)
      expect(SequenceRunner['listeners']).toStrictEqual({ [listenerId2]: listener })
    })

    it('removes listener from the attached EventTarget', () => {
      SequenceRunner.removeListener(listenerId1)
      expect(removeEventListenerSpy).toHaveBeenCalledExactlyOnceWith(
        SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
        listener
      )
    })

    it('does nothing when a listener with the same ID is not registered', () => {
      SequenceRunner.removeListener(listenerId1)
      removeEventListenerSpy.mockReset()
      expect(removeEventListenerSpy).not.toHaveBeenCalled()

      SequenceRunner.removeListener(listenerId1)
      expect(removeEventListenerSpy).not.toHaveBeenCalled()
    })
  })

  describe('listListeners', () => {
    let listenerId1: string
    let listenerId2: string

    beforeEach(() => {
      listenerId1 = randomUUID()
      listenerId2 = randomUUID()

      SequenceRunner.addListener(listenerId1, vi.fn())
      SequenceRunner.addListener(listenerId2, vi.fn())
    })

    it('provides an array of IDs for currently registered listeners', () => {
      expect(SequenceRunner.listListeners()).toStrictEqual([listenerId1, listenerId2])
    })
  })

  describe('executeSequence', () => {
    const sendMessageSpy = vi.spyOn(SequenceRunner, <never>'sendMessage')

    let sequenceName: string

    beforeEach(() => {
      sequenceName = randomUUID()
    })

    afterEach(() => {
      sendMessageSpy.mockReset()
    })

    it('sends a message that the sequence began executing', async () => {
      await SequenceRunner.executeSequence({ name: sequenceName, targets: [] })
      expect(sendMessageSpy).toHaveBeenCalledTimes(2)
      expect(sendMessageSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          detail: {
            sequenceName,
            messageType: SequenceRunnerEventType.beganExecuting
          }
        })
      )
    })

    it.skip('executes each target in the provided sequence', async () => {})

    it.skip('sends message when an error is thrown for a target', async () => {})

    it.skip('continues handling subsequent targets when error is thrown by previous target', async () => {})

    it('sends a message that the sequence finished executing', async () => {
      await SequenceRunner.executeSequence({ name: sequenceName, targets: [] })
      console.log(sendMessageSpy.mock.calls)
      expect(sendMessageSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          detail: {
            sequenceName,
            messageType: SequenceRunnerEventType.finishedExecuting
          }
        })
      )
    })

    describe('when handling clickAllFound strategy', () => {
      it.skip('defaults to a timeBetweenMs of 0', async () => {})

      it.skip('respects custom timeBetweenMs', async () => {})

      it.skip('defaults to a maxClicks of 1000', async () => {})

      it.skip('respects custom maxClicks', async () => {})

      it.skip('treats negative number of maxClicks as Infinity', async () => {})

      it.skip('sends a message for the number of elements found', async () => {})

      it.skip('sends error message if an element is unclickable', async () => {})

      it.skip('waits in between clicks based on timeBetweenMs', async () => {})

      it.skip('keeps clicking up until maxClicks', async () => {})

      it.skip('sends a message if maxClicks is reached', async () => {})

      it.skip('sends a message for how many elements were clicked', async () => {})
    })

    describe('when handling clickWhilePresent strategy', () => {
      it.skip('defaults to a timeBetweenMs of 0', async () => {})

      it.skip('respects custom timeBetweenMs', async () => {})

      it.skip('defaults to a maxClicks of 1000', async () => {})

      it.skip('respects custom maxClicks', async () => {})

      it.skip('treats negative number of maxClicks as Infinity', async () => {})

      it.skip('sends error message if an element is unclickable', async () => {})

      it.skip('waits in between clicks based on timeBetweenMs', async () => {})

      it.skip('keeps clicking up until maxClicks', async () => {})

      it.skip('sends a message if maxClicks is reached', async () => {})

      it.skip('sends a message for how many elements were clicked', async () => {})
    })

    describe('when handling an unrecognized strategy', () => {
      it.skip('sends message for corresponding error', async () => {})
    })
  })

  describe('sendMessage', () => {
    it('dispatches provided message as an event to the event target', () => {
      const dispatchEventSpy = vi.spyOn(window.EventTarget.prototype, 'dispatchEvent')
      const event: SequenceRunnerEvent = new SequenceRunnerEvent({
        sequenceName: 'example',
        messageType: SequenceRunnerEventType.beganExecuting
      })
      SequenceRunner['sendMessage'](event)
      expect(dispatchEventSpy).toHaveBeenCalledWith(event)
    })
  })
})
