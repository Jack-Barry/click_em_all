/**
 * Need to set `chrome.runtime.id` for `webextension-polyfill` to be mockable during
 *   tests, per https://github.com/mozilla/webextension-polyfill/issues/218#issuecomment-584936358
 */
// @ts-ignore
global.chrome = {
  runtime: {
    id: "testid",
  },
};

/**
 * Stub browser methods that are used in tests here. In test files, can use `spyOn`
 *   to override mocks
 */
vi.mock("webextension-polyfill", async () => {
  return {
    default: {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn(),
        },
      },
    },
  };
});
