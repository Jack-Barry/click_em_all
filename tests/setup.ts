import '@testing-library/jest-dom/vitest'

process.env.TZ = 'UTC'

vi.mock('webext-bridge/popup', () => {
  return {
    onMessage: vi.fn(),
    sendMessage: vi.fn()
  }
})

vi.mock('webextension-polyfill', async () => {
  const { fakeBrowser } = await import('@webext-core/fake-browser')

  const mockModule: Awaited<typeof import('webextension-polyfill')> = {
    ...fakeBrowser,
    runtime: {
      ...fakeBrowser.runtime,
      openOptionsPage: vi.fn()
    }
  }

  return {
    default: mockModule,
    browser: mockModule
  }
})
