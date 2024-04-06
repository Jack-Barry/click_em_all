import browser from "webextension-polyfill";
import { appStorage } from "../../../../src/lib/data/extensionStorage";
import { StoredOptionsKeys } from "../../../../src/lib/data/extensionStorage/constants";

describe("Data: using Extension Storage: targets", () => {
  describe("get", () => {
    test("returns data for targets key", async () => {
      const mockData = { foo: "bar" };
      vi.spyOn(browser.storage.local, "get").mockImplementation(async (key) => {
        if (key === StoredOptionsKeys.targets) {
          return mockData;
        }

        return {};
      });

      const targets = await appStorage.targets.get();
      expect(targets).toStrictEqual(mockData);
    });
  });
});
