import browser from "webextension-polyfill";

import { ClickerTargetStrategyType } from "../../../../src/lib/Clicker/schemas";
import {
  ExtensionStorage,
  appStorage,
} from "../../../../src/lib/data/extensionStorage";
import type { ClickerTargetsConfig } from "../../../../src/lib/data/types";

describe("Data: using Extension Storage: targets", () => {
  let mockData: ClickerTargetsConfig;

  beforeEach(() => {
    mockData = { mockurl: [] };
    vi.spyOn(browser.storage.local, "get").mockImplementation(async (key) => {
      if (key === ExtensionStorage.STORAGE_KEYS.TARGETS) {
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

  describe("addUrl", () => {
    test("does nothing if URL already exists", async () => {
      await appStorage.targets.addUrl("mockurl");
      expect(browser.storage.local.set).not.toHaveBeenCalled();
    });

    test("adds new URL to targets config", async () => {
      await appStorage.targets.addUrl("newurl");
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          ...mockData,
          newurl: [],
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
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          otherUrl: [],
        },
      });
    });
  });

  describe("moveUrl", () => {
    test("does nothing if old and new URL are the same", async () => {
      await appStorage.targets.moveUrl("mockurl", "mockurl");
      expect(browser.storage.local.set).not.toHaveBeenCalled();
    });

    test("throws error if new URL already exists", async () => {
      mockData.existingurl = [];
      await expect(
        appStorage.targets.moveUrl("mockurl", "existingurl")
      ).rejects.toEqual(new Error("URL already in use: existingurl"));
      expect(browser.storage.local.set).not.toHaveBeenCalled();
    });

    test("moves URL data to new key", async () => {
      mockData.mockurl = [{ id: "sequence_id", name: "sequence", targets: [] }];
      await appStorage.targets.moveUrl("mockurl", "newurl");
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          newurl: [{ id: "sequence_id", name: "sequence", targets: [] }],
        },
      });
    });
  });

  describe("addSequence", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("a-b-c-d-e");

    test("creates new sequence array when sequences do not yet exist for the URL", async () => {
      await appStorage.targets.addSequence("new_url", {
        name: "New Group",
        targets: [],
      });

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          ...mockData,
          new_url: [{ id: "a-b-c-d-e", name: "New Group", targets: [] }],
        },
      });
    });

    test("appends new sequence when sequences already exist for the URL", async () => {
      mockData.mockurl.push({ id: "existing", name: "Existing", targets: [] });
      await appStorage.targets.addSequence("mockurl", {
        name: "New Group",
        targets: [],
      });

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            { id: "existing", name: "Existing", targets: [] },
            { id: "a-b-c-d-e", name: "New Group", targets: [] },
          ],
        },
      });
    });
  });

  describe("editSequence", () => {
    test("throws error when sequence does not exist", async () => {
      await expect(
        appStorage.targets.editSequence("mockurl", "badId", {})
      ).rejects.toEqual(new Error("No sequence found matching ID: badId"));
    });

    test("updates targeted sequence with provided data", async () => {
      mockData.mockurl = [
        { id: "sequence1", name: "Sequence One", targets: [] },
        {
          id: "sequence2",
          name: "Sequence Two",
          targets: [
            {
              name: "Target One",
              selector: ".selector",
              strategy: ClickerTargetStrategyType.allFound,
            },
          ],
        },
        { id: "sequence3", name: "Sequence Three", targets: [] },
      ];
      await appStorage.targets.editSequence("mockurl", "sequence2", {
        name: "New Name",
      });
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            { id: "sequence1", name: "Sequence One", targets: [] },
            {
              id: "sequence2",
              name: "New Name",
              targets: [
                {
                  name: "Target One",
                  selector: ".selector",
                  strategy: ClickerTargetStrategyType.allFound,
                },
              ],
            },
            { id: "sequence3", name: "Sequence Three", targets: [] },
          ],
        },
      });
    });
  });

  describe("removeSequence", () => {
    test("removes sequence from URL", async () => {
      mockData.mockurl = [
        { id: "a", name: "A", targets: [] },
        { id: "b", name: "B", targets: [] },
        { id: "c", name: "C", targets: [] },
      ];
      await appStorage.targets.removeSequence("mockurl", "b");
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            { id: "a", name: "A", targets: [] },
            { id: "c", name: "C", targets: [] },
          ],
        },
      });
    });
  });

  describe("addTargetToSequence", () => {
    test("throws error if no URL data is available", async () => {
      await expect(
        appStorage.targets.addTargetToSequence("badurl", "a", {
          name: "New Target",
          selector: ".new",
          strategy: ClickerTargetStrategyType.allFound,
        })
      ).rejects.toEqual(new Error("No data available for URL: badurl"));
    });

    test("throws error if no sequence data is available", async () => {
      await expect(
        appStorage.targets.addTargetToSequence("mockurl", "a", {
          name: "New Target",
          selector: ".new",
          strategy: ClickerTargetStrategyType.allFound,
        })
      ).rejects.toEqual(new Error("No sequence found matching ID: a"));
    });

    test("adds provided target to matching sequence", async () => {
      mockData.mockurl = [
        {
          id: "a",
          name: "Sequence A",
          targets: [
            {
              name: "Existing Target",
              selector: ".existing",
              strategy: ClickerTargetStrategyType.allFound,
            },
          ],
        },
      ];
      await appStorage.targets.addTargetToSequence("mockurl", "a", {
        name: "New Target",
        selector: ".new",
        strategy: ClickerTargetStrategyType.allFound,
      });
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            {
              id: "a",
              name: "Sequence A",
              targets: [
                {
                  name: "Existing Target",
                  selector: ".existing",
                  strategy: ClickerTargetStrategyType.allFound,
                },
                {
                  name: "New Target",
                  selector: ".new",
                  strategy: ClickerTargetStrategyType.allFound,
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe("editTarget", () => {
    test("throws error if no URL data is available", async () => {
      await expect(
        appStorage.targets.editTarget("badurl", "a", 1, {})
      ).rejects.toEqual(new Error("No data available for URL: badurl"));
    });

    test("throws error if no sequence data is available", async () => {
      await expect(
        appStorage.targets.editTarget("mockurl", "a", 1, {})
      ).rejects.toEqual(new Error("No sequence found matching ID: a"));
    });

    test("throws error if no target data is available", async () => {
      mockData.mockurl = [{ id: "a", name: "Sequence A", targets: [] }];
      await expect(
        appStorage.targets.editTarget("mockurl", "a", 0, {})
      ).rejects.toEqual(new Error("No target found at index: 0"));
    });

    test("updates target with provided data", async () => {
      mockData.mockurl = [
        {
          id: "a",
          name: "Sequence A",
          targets: [
            {
              name: "Target1",
              selector: ".target1",
              strategy: ClickerTargetStrategyType.allFound,
            },
            {
              name: "Target2",
              selector: ".target2",
              strategy: ClickerTargetStrategyType.allFound,
            },
            {
              name: "Target3",
              selector: ".target3",
              strategy: ClickerTargetStrategyType.allFound,
            },
          ],
        },
      ];
      await appStorage.targets.editTarget("mockurl", "a", 1, {
        name: "Target Two",
        maxClicks: 1,
      });
      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            {
              id: "a",
              name: "Sequence A",
              targets: [
                {
                  name: "Target1",
                  selector: ".target1",
                  strategy: ClickerTargetStrategyType.allFound,
                },
                {
                  name: "Target Two",
                  selector: ".target2",
                  strategy: ClickerTargetStrategyType.allFound,
                  maxClicks: 1,
                },
                {
                  name: "Target3",
                  selector: ".target3",
                  strategy: ClickerTargetStrategyType.allFound,
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe("removeTargetFromSequence", () => {
    test("throws error if no URL data is available", async () => {
      await expect(
        appStorage.targets.removeTargetFromSequence("badurl", "a", 1)
      ).rejects.toEqual(new Error("No data available for URL: badurl"));
    });

    test("throws error if no sequence data is available", async () => {
      await expect(
        appStorage.targets.removeTargetFromSequence("mockurl", "a", 1)
      ).rejects.toEqual(new Error("No sequence found matching ID: a"));
    });

    test("removes target from sequence", async () => {
      mockData.mockurl = [
        {
          id: "a",
          name: "Sequence A",
          targets: [
            {
              name: "Target1",
              selector: ".target1",
              strategy: ClickerTargetStrategyType.allFound,
            },
            {
              name: "Target2",
              selector: ".target2",
              strategy: ClickerTargetStrategyType.allFound,
            },
            {
              name: "Target3",
              selector: ".target3",
              strategy: ClickerTargetStrategyType.allFound,
            },
          ],
        },
      ];
      await appStorage.targets.removeTargetFromSequence("mockurl", "a", 1);

      expect(browser.storage.local.set).toHaveBeenCalledOnce();
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        [ExtensionStorage.STORAGE_KEYS.TARGETS]: {
          mockurl: [
            {
              id: "a",
              name: "Sequence A",
              targets: [
                {
                  name: "Target1",
                  selector: ".target1",
                  strategy: ClickerTargetStrategyType.allFound,
                },
                {
                  name: "Target3",
                  selector: ".target3",
                  strategy: ClickerTargetStrategyType.allFound,
                },
              ],
            },
          ],
        },
      });
    });
  });
});
