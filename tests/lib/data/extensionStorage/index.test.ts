import browser from "webextension-polyfill";
import { appStorage } from "../../../../src/lib/data/extensionStorage";
import { StoredOptionsKeys } from "../../../../src/lib/data/extensionStorage/constants";
import type { ClickerTargetsConfig } from "../../../../src/lib/data/types";
import { ClickerTargetStrategyType } from "../../../../src/lib/Clicker/Clicker";

describe("Data: using Extension Storage: targets", () => {
  let mockData: ClickerTargetsConfig;

  beforeEach(() => {
    mockData = { mockurl: [] };
    vi.spyOn(browser.storage.local, "get").mockImplementation(async (key) => {
      if (key === StoredOptionsKeys.targets) {
        return { targets: mockData };
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

  describe("removeUrl", () => {
    test("removes data for URL from storage", async () => {
      mockData.otherUrl = [];
      await appStorage.targets.removeUrl("mockurl");

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [StoredOptionsKeys.targets]: {
          otherUrl: [],
        },
      });
    });
  });

  describe("getGroups", () => {
    test("returns groups for given URL", async () => {
      mockData.mockurl1 = [
        { id: "a", name: "A", targets: [] },
        { id: "b", name: "B", targets: [] },
      ];
      let groups = await appStorage.targets.getGroups("mockurl1");
      expect(groups).toStrictEqual([
        { id: "a", name: "A", targets: [] },
        { id: "b", name: "B", targets: [] },
      ]);

      groups = await appStorage.targets.getGroups("mockurl");
      expect(groups).toStrictEqual([]);
    });

    test("returns undefined for missing urls", async () => {
      const groups = await appStorage.targets.getGroups("missing_url");
      expect(groups).toBeUndefined();
    });
  });

  describe("editGroup", () => {
    test("updates targeted group with provided data", async () => {
      mockData.mockurl = [
        { id: "a", name: "A", targets: [] },
        { id: "b", name: "B", targets: [] },
        { id: "c", name: "C", targets: [] },
      ];
      await appStorage.targets.editGroup("mockurl", "b", {
        name: "New Name",
        targets: [
          {
            name: "New Target",
            selector: ".class",
            strategy: ClickerTargetStrategyType.allFound,
          },
        ],
      });

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [StoredOptionsKeys.targets]: {
          mockurl: [
            { id: "a", name: "A", targets: [] },
            {
              id: "b",
              name: "New Name",
              targets: [
                {
                  name: "New Target",
                  selector: ".class",
                  strategy: ClickerTargetStrategyType.allFound,
                },
              ],
            },
            { id: "c", name: "C", targets: [] },
          ],
        },
      });
    });
  });

  describe("removeGroup", () => {
    test("removes group from storage", async () => {
      mockData.mockurl = [
        { id: "a", name: "A", targets: [] },
        { id: "b", name: "B", targets: [] },
        { id: "c", name: "C", targets: [] },
      ];
      await appStorage.targets.removeGroup("mockurl", "b");

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [StoredOptionsKeys.targets]: {
          mockurl: [
            { id: "a", name: "A", targets: [] },
            { id: "c", name: "C", targets: [] },
          ],
        },
      });
    });
  });
});
