import Browser from "webextension-polyfill";
import type {
  AppData,
  ClickerTargetsConfig,
  ClickerTargetsConfigTargetGroup,
} from "../types";
import { StoredOptionsKeys } from "./constants";

/** `AppData` implemented by interacting with extension storage */
class ExtensionStorage implements AppData {
  targets = {
    get: async () => {
      return (await Browser.storage.local.get(
        StoredOptionsKeys.targets
      )) as ClickerTargetsConfig;
    },

    addGroup: async (
      url: string,
      group: Omit<ClickerTargetsConfigTargetGroup, "id">
    ) => {
      const existingTargets = await this.targets.get();
      const id = crypto.randomUUID();
      const newTargets: ClickerTargetsConfig = {
        ...existingTargets,
        [url]: [...(existingTargets[url] || []), { ...group, id }],
      };

      await Browser.storage.local.set({
        [StoredOptionsKeys.targets]: newTargets,
      });
      return { id };
    },

    getGroups: async (url: string) => {
      const data = await this.targets.get();
      return data[url];
    },

    editGroup: async (
      url: string,
      groupId: string,
      data: Partial<Omit<ClickerTargetsConfigTargetGroup, "id">>
    ) => {
      const existingTargets = await this.targets.get();
      const groupIndex = existingTargets[url].findIndex(
        (v) => v.id === groupId
      );
      const newTargets: ClickerTargetsConfig = {
        ...existingTargets,
        [url]: [
          ...existingTargets[url].slice(0, groupIndex),
          { ...existingTargets[url][groupIndex], ...data },
          ...existingTargets[url].slice(groupIndex + 1),
        ],
      };
      await Browser.storage.local.set({
        [StoredOptionsKeys.targets]: newTargets,
      });
    },

    removeGroup: async (url: string, groupId: string) => {
      const existingTargets = await this.targets.get();
      const groupIndex = existingTargets[url].findIndex(
        (v) => v.id === groupId
      );
      const newTargets: ClickerTargetsConfig = {
        ...existingTargets,
        [url]: [
          ...existingTargets[url].slice(0, groupIndex),
          ...existingTargets[url].slice(groupIndex + 1),
        ],
      };
      await Browser.storage.local.set({
        [StoredOptionsKeys.targets]: newTargets,
      });
    },
  };
}

export const appStorage = new ExtensionStorage() as AppData;
