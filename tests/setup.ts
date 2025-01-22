import '@testing-library/jest-dom/vitest'

process.env.TZ = 'UTC'

/**
 * Need to set `chrome.runtime.id` for `webextension-polyfill` to be mockable during
 *   tests, per https://github.com/mozilla/webextension-polyfill/issues/218#issuecomment-584936358
 */
// @ts-ignore
global.chrome = {
  runtime: {
    id: 'testid',
    connect: vi.fn().mockReturnValue({
      onMessage: {
        addListener: vi.fn()
      },
      onDisconnect: {
        addListener: vi.fn()
      },
      postMessage: vi.fn()
    })
  }
}

/**
 * Stub browser methods that are used in tests here. In test files, can use `spyOn`
 *   to override mocks
 */
vi.mock('wxt/browser', async () => {
  return {
    runtime: {
      openOptionsPage: vi.fn()
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() }
      }
    },
    tabs: {
      query: vi.fn()
    }
  }
})
