import { SequenceRunner } from '../../../../src/entries/contentScript/primary/SequenceRunner'

describe('contentScript: SequenceRunner', () => {
  afterEach(() => {
    SequenceRunner['reset']()
  })

  describe('addListener', () => {
    it.skip('registers a listener with the provided ID', () => {})

    it.skip('adds a listener to the attached EventTarget', () => {})

    it.skip('does nothing when a listener with the same ID is already registered', () => {})
  })

  describe('removeListener', () => {
    it.skip('removes listener with matching ID', () => {})

    it.skip('removes listener from the attached EventTarget', () => {})

    it.skip('does nothing when a listener with the same ID is not registered', () => {})
  })

  describe('listListeners', () => {
    it.skip('provides an array of IDs for currently registered listeners', () => {})
  })

  describe('executeSequence', () => {
    it.skip('sends a message that the sequence began executing', async () => {})

    it.skip('executes for each target in the provided sequence', async () => {})

    it.skip('sends message when an error is thrown for a target', async () => {})

    it.skip('continues handling subsequent targets when error is thrown by previous target', async () => {})

    it.skip('sends a message that the sequence finished executing', async () => {})

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
})
