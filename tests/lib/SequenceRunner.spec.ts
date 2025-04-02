import { randomInt, randomUUID } from 'node:crypto'
import type { MockInstance } from 'vitest'
import {
  SequenceActionTarget,
  ActionSequence,
  ActionTargetStrategyType
} from '../../src/lib/models/config'
import {
  SequenceRunner,
  SEQUENCE_RUNNER_EMITTED_EVENT_TYPE,
  SequenceRunnerEventType,
  SequenceRunnerEvent
} from '../../src/lib/SequenceRunner'
import * as pause from '../../src/lib/utils/pause'
import { _getSequenceTarget_ } from './models/testUtils'

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
    const handleTargetSpy = vi.spyOn(SequenceRunner, <never>'handleTarget')

    let sequenceName: string

    beforeEach(() => {
      sequenceName = randomUUID()
    })

    afterEach(() => {
      sendMessageSpy.mockReset()
      handleTargetSpy.mockReset()
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

    it('executes each target in the provided sequence', async () => {
      handleTargetSpy.mockResolvedValue(undefined)
      const target1: SequenceActionTarget = _getSequenceTarget_()
      const target2: SequenceActionTarget = _getSequenceTarget_()

      await SequenceRunner.executeSequence({ name: sequenceName, targets: [target1, target2] })

      expect(handleTargetSpy).toHaveBeenCalledTimes(2)
      expect(handleTargetSpy).toHaveBeenNthCalledWith(1, sequenceName, target1)
      expect(handleTargetSpy).toHaveBeenNthCalledWith(2, sequenceName, target2)
    })

    it('sends message when an error is thrown for a target', async () => {
      handleTargetSpy.mockRejectedValue(new Error('bad request'))
      const target: SequenceActionTarget = _getSequenceTarget_()

      await SequenceRunner.executeSequence({ name: sequenceName, targets: [target] })

      expect(sendMessageSpy).toHaveBeenCalledTimes(3)
      expect(sendMessageSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          detail: {
            sequenceName,
            messageType: SequenceRunnerEventType.error,
            error: 'bad request'
          }
        })
      )
    })

    it('sends message when an error with no message is thrown for a target', async () => {
      handleTargetSpy.mockRejectedValue('bad request')
      const target: SequenceActionTarget = _getSequenceTarget_()

      await SequenceRunner.executeSequence({ name: sequenceName, targets: [target] })

      expect(sendMessageSpy).toHaveBeenCalledTimes(3)
      expect(sendMessageSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          detail: {
            sequenceName,
            messageType: SequenceRunnerEventType.error,
            error: 'unknown'
          }
        })
      )
    })

    it('continues handling subsequent targets when error is thrown by previous target', async () => {
      handleTargetSpy.mockRejectedValueOnce(new Error('bad request')).mockResolvedValue(undefined)
      const target1: SequenceActionTarget = _getSequenceTarget_()
      const target2: SequenceActionTarget = _getSequenceTarget_()

      await SequenceRunner.executeSequence({ name: sequenceName, targets: [target1, target2] })

      expect(handleTargetSpy).toHaveBeenCalledTimes(2)
      expect(handleTargetSpy).toHaveBeenNthCalledWith(1, sequenceName, target1)
      expect(handleTargetSpy).toHaveBeenNthCalledWith(2, sequenceName, target2)
    })

    it('sends a message that the sequence finished executing', async () => {
      await SequenceRunner.executeSequence({ name: sequenceName, targets: [] })
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
      const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll')
      const clickAllFoundSpy = vi.spyOn(SequenceRunner, <never>'clickAllFound')
      const click = vi.fn()
      let target: SequenceActionTarget
      let sequence: ActionSequence

      beforeEach(() => {
        target = _getSequenceTarget_()
        target.strategy = ActionTargetStrategyType.clickAllFound
        sequence = { name: sequenceName, targets: [target] }
      })

      it('defaults to a timeBetweenMs of 0', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(clickAllFoundSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ timeBetweenMs: 0 })
        )
      })

      it('respects custom timeBetweenMs', async () => {
        target.timeBetweenMs = 100
        await SequenceRunner.executeSequence(sequence)

        expect(clickAllFoundSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ timeBetweenMs: 100 })
        )
      })

      it('defaults to a maxClicks of 1000', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(clickAllFoundSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: 1000 })
        )
      })

      it('respects custom maxClicks', async () => {
        target.maxClicks = 100
        await SequenceRunner.executeSequence(sequence)

        expect(clickAllFoundSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: 100 })
        )
      })

      it('treats negative number of maxClicks as Infinity', async () => {
        target.maxClicks = -1
        await SequenceRunner.executeSequence(sequence)

        expect(clickAllFoundSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: Infinity })
        )
      })

      it('sends a message for the number of elements found', async () => {
        const matchingElements = makeQuerySelectorAllReturnValue()
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.foundElements,
              elementCount: matchingElements.length
            }
          })
        )
      })

      it('sends error message if an element is unclickable', async () => {
        const getHtmlResult = randomUUID()
        const matchingElements = [
          { getHTML: () => getHtmlResult } as Element
        ] as unknown as NodeListOf<Element>
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              messageType: SequenceRunnerEventType.error,
              error: `element for selector ${target.selector} is not clickable: ${getHtmlResult}`
            }
          })
        )
      })

      it('waits in between clicks based on timeBetweenMs', async () => {
        const pauseSpy = vi.spyOn(pause, 'pause').mockResolvedValue(undefined)
        target.timeBetweenMs = randomInt(2, 999)
        const matchingElements = makeQuerySelectorAllReturnValue()
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(pauseSpy).toHaveBeenCalledTimes(matchingElements.length)
        expect(pauseSpy).toHaveBeenCalledWith(target.timeBetweenMs)
      })

      it('keeps clicking up until maxClicks', async () => {
        const matchingElements = makeQuerySelectorAllReturnValue()
        target.maxClicks = matchingElements.length - 1
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(click).toHaveBeenCalledTimes(target.maxClicks)
      })

      it('sends a message if maxClicks is reached', async () => {
        const matchingElements = makeQuerySelectorAllReturnValue()
        target.maxClicks = matchingElements.length - 1
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.reachedMaxClicks,
              configuredMaximum: target.maxClicks
            }
          })
        )
      })

      it('sends a message for how many elements were clicked', async () => {
        const matchingElements = makeQuerySelectorAllReturnValue()
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements,
              clickCount: matchingElements.length
            }
          })
        )
      })

      it('sends a message for how many elements were clicked even if maxClicks was reached', async () => {
        const matchingElements = makeQuerySelectorAllReturnValue()
        target.maxClicks = matchingElements.length - 1
        querySelectorAllSpy.mockReturnValueOnce(matchingElements)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements,
              clickCount: target.maxClicks
            }
          })
        )
      })

      it('skips sending a message for how many times the matching element was clicked if it was never found', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            detail: expect.objectContaining({
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements
            })
          })
        )
      })

      function makeQuerySelectorAllReturnValue() {
        return Array.from({ length: randomInt(2, 999) }).map(
          () => ({ click }) as unknown as Element
        ) as unknown as NodeListOf<Element>
      }
    })

    describe('when handling clickWhilePresent strategy', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
      const clickWhilePresentSpy = vi.spyOn(SequenceRunner, <never>'clickWhilePresent')
      const click = vi.fn()

      let target: SequenceActionTarget
      let sequence: ActionSequence
      let matchingElement: Element

      beforeEach(() => {
        target = _getSequenceTarget_()
        target.strategy = ActionTargetStrategyType.clickWhilePresent
        sequence = { name: sequenceName, targets: [target] }
        matchingElement = { click } as unknown as Element
      })

      it('defaults to a timeBetweenMs of 0', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(clickWhilePresentSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ timeBetweenMs: 0 })
        )
      })

      it('respects custom timeBetweenMs', async () => {
        target.timeBetweenMs = 100
        await SequenceRunner.executeSequence(sequence)

        expect(clickWhilePresentSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ timeBetweenMs: 100 })
        )
      })

      it('defaults to a maxClicks of 1000', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(clickWhilePresentSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: 1000 })
        )
      })

      it('respects custom maxClicks', async () => {
        target.maxClicks = 100
        await SequenceRunner.executeSequence(sequence)

        expect(clickWhilePresentSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: 100 })
        )
      })

      it('treats negative number of maxClicks as Infinity', async () => {
        target.maxClicks = -1
        await SequenceRunner.executeSequence(sequence)

        expect(clickWhilePresentSpy).toHaveBeenCalledExactlyOnceWith(
          sequenceName,
          expect.objectContaining({ maxClicks: Infinity })
        )
      })

      it('sends error message if an element is unclickable', async () => {
        const getHtmlResult = randomUUID()
        // @ts-expect-error
        delete matchingElement.click
        matchingElement.getHTML = () => getHtmlResult
        querySelectorSpy.mockReturnValueOnce(matchingElement)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              messageType: SequenceRunnerEventType.error,
              error: `element for selector ${target.selector} is not clickable: ${getHtmlResult}`
            }
          })
        )
      })

      it('waits in between clicks based on timeBetweenMs', async () => {
        const pauseSpy = vi.spyOn(pause, 'pause').mockResolvedValue(undefined)
        target.timeBetweenMs = randomInt(2, 999)
        const timesFound = randomInt(2, 999)
        mockReturnValueNTimes(querySelectorSpy, timesFound, matchingElement)

        await SequenceRunner.executeSequence(sequence)

        expect(pauseSpy).toHaveBeenCalledTimes(timesFound)
        expect(pauseSpy).toHaveBeenCalledWith(target.timeBetweenMs)
      })

      it('keeps clicking up until maxClicks', async () => {
        const timesFound = randomInt(2, 999)
        mockReturnValueNTimes(querySelectorSpy, timesFound, matchingElement)
        target.maxClicks = timesFound - 1

        await SequenceRunner.executeSequence(sequence)

        expect(click).toHaveBeenCalledTimes(target.maxClicks)
      })

      it('sends a message if maxClicks is reached', async () => {
        const timesFound = randomInt(2, 999)
        mockReturnValueNTimes(querySelectorSpy, timesFound, matchingElement)
        target.maxClicks = timesFound - 1

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.reachedMaxClicks,
              configuredMaximum: target.maxClicks
            }
          })
        )
      })

      it('sends a message for how many times the matching element was clicked', async () => {
        const timesFound = randomInt(2, 999)
        mockReturnValueNTimes(querySelectorSpy, timesFound, matchingElement)

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements,
              clickCount: timesFound
            }
          })
        )
      })

      it('sends a message for how many elements were clicked even if maxClicks was reached', async () => {
        const timesFound = randomInt(2, 999)
        mockReturnValueNTimes(querySelectorSpy, timesFound, matchingElement)
        target.maxClicks = timesFound - 1

        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements,
              clickCount: target.maxClicks
            }
          })
        )
      })

      it('skips sending a message for how many times the matching element was clicked if it was never found', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            detail: expect.objectContaining({
              sequenceName,
              targetName: target.name,
              messageType: SequenceRunnerEventType.clickedElements
            })
          })
        )
      })
    })

    describe('when handling an unrecognized strategy', () => {
      let target: SequenceActionTarget
      let sequence: ActionSequence

      beforeEach(() => {
        target = _getSequenceTarget_()
        // @ts-expect-error
        target.strategy = randomUUID()
        sequence = { name: sequenceName, targets: [target] }
      })

      it('sends message for corresponding error', async () => {
        await SequenceRunner.executeSequence(sequence)

        expect(sendMessageSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: {
              sequenceName,
              messageType: SequenceRunnerEventType.error,
              error: `unrecognized strategy: ${target.strategy}`
            }
          })
        )
      })
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

function mockReturnValueNTimes<T extends (...args: any[]) => any>(
  spy: MockInstance<T>,
  n: number,
  returnValue: any
) {
  for (let i = 0; i < n; i++) {
    spy.mockReturnValueOnce(returnValue)
  }
}
