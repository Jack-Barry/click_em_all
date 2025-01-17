/**
 * Stub browser methods that are used in tests here. In test files, can use `spyOn`
 *   to override mocks
 */
vi.mock('webextension-polyfill', async () => {
  return {
    default: {
      runtime: {
        openOptionsPage: vi.fn()
      }
    }
  };
});
