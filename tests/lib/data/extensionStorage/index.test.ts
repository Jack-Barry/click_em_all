import browser from "webextension-polyfill";
import { appStorage } from "../../../../src/lib/data/extensionStorage";
import { StoredOptionsKeys } from "../../../../src/lib/data/extensionStorage/constants";
import type { ClickerTargetsConfig } from "../../../../src/lib/data/types";

describe("Data: using Extension Storage: targets", () => {
  let mockData: ClickerTargetsConfig;

  beforeEach(() => {
    mockData = { mockurl: [] };
    vi.spyOn(browser.storage.local, "get").mockImplementation(async (key) => {
      if (key === StoredOptionsKeys.targets) {
        return mockData;
      }

      return {};
    });
  });

  describe("get", () => {
    test("returns data for targets key", async () => {
      const targets = await appStorage.targets.get();
      expect(targets).toStrictEqual(mockData);
    });
  });

  describe("addGroup", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("a-b-c-d-e");

    test("creates new groups array when groups do not yet exist for the URL", async () => {
      const result = await appStorage.targets.addGroup("new_url", {
        name: "New Group",
        targets: [],
      });
      expect(result.id).toBeTypeOf("string");
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [StoredOptionsKeys.targets]: {
          ...mockData,
          new_url: [{ id: "a-b-c-d-e", name: "New Group", targets: [] }],
        },
      });
    });

    test("appends new group when groups already exist for the URL", async () => {
      mockData.mockurl.push({ id: "existing", name: "Existing", targets: [] });
      const result = await appStorage.targets.addGroup("mockurl", {
        name: "New Group",
        targets: [],
      });
      expect(result.id).toBeTypeOf("string");
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [StoredOptionsKeys.targets]: {
          mockurl: [
            { id: "existing", name: "Existing", targets: [] },
            { id: "a-b-c-d-e", name: "New Group", targets: [] },
          ],
        },
      });
    });
  });
});
