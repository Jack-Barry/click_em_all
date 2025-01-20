import { pause } from '../../../src/lib/utils/pause'

describe('utils: pause', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits the provided number of milliseconds', async () => {
    const pauseFollower = vi.fn()
    pause(1000).then(pauseFollower)
    expect(pauseFollower).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(999)
    expect(pauseFollower).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(pauseFollower).toHaveBeenCalled()
  })
})
