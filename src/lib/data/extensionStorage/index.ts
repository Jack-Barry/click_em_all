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
      const allData =
        (await Browser.storage.local.get(StoredOptionsKeys.targets)) || {};
      return (allData[StoredOptionsKeys.targets] || {}) as ClickerTargetsConfig;
    },

    addUrl: async (url: string) => {
      const data = await this.targets.get();
      if (data[url]) {
        return;
      }

      data[url] = [];
      await this.#setTargets(data);
    },

    removeUrl: async (url: string) => {
      const data = await this.targets.get();
      delete data[url];
      await this.#setTargets(data);
    },

    moveUrl: async (oldUrl: string, newUrl: string) => {
      if (oldUrl === newUrl) {
        return;
      }

      const data = await this.targets.get();
      if (data[newUrl]) {
        throw new Error(`URL already in use: ${newUrl}`);
      }

      const target = data[oldUrl];
      data[newUrl] = target;
      delete data[oldUrl];
      await this.#setTargets(data);
    },

    //   addGroup: async (
    //     url: string,
    //     group: Omit<ClickerTargetsConfigTargetGroup, "id">
    //   ) => {
    //     const existingTargets = await this.targets.get();
    //     const id = crypto.randomUUID();
    //     const newTargets: ClickerTargetsConfig = {
    //       ...existingTargets,
    //       [url]: [...(existingTargets[url] || []), { ...group, id }],
    //     };

    //     await Browser.storage.local.set({
    //       [StoredOptionsKeys.targets]: newTargets,
    //     });
    //     return { id };
    //   },

    //   getGroups: async (url: string) => {
    //     const data = await this.targets.get();
    //     return data[url];
    //   },

    //   editGroup: async (
    //     url: string,
    //     groupId: string,
    //     data: Partial<Omit<ClickerTargetsConfigTargetGroup, "id">>
    //   ) => {
    //     const existingTargets = await this.targets.get();
    //     const groupIndex = existingTargets[url].findIndex(
    //       (v) => v.id === groupId
    //     );
    //     const newTargets: ClickerTargetsConfig = {
    //       ...existingTargets,
    //       [url]: [
    //         ...existingTargets[url].slice(0, groupIndex),
    //         { ...existingTargets[url][groupIndex], ...data },
    //         ...existingTargets[url].slice(groupIndex + 1),
    //       ],
    //     };
    //     await Browser.storage.local.set({
    //       [StoredOptionsKeys.targets]: newTargets,
    //     });
    //   },

    //   removeGroup: async (url: string, groupId: string) => {
    //     const existingTargets = await this.targets.get();
    //     const groupIndex = existingTargets[url].findIndex(
    //       (v) => v.id === groupId
    //     );
    //     const newTargets: ClickerTargetsConfig = {
    //       ...existingTargets,
    //       [url]: [
    //         ...existingTargets[url].slice(0, groupIndex),
    //         ...existingTargets[url].slice(groupIndex + 1),
    //       ],
    //     };
    //     await Browser.storage.local.set({
    //       [StoredOptionsKeys.targets]: newTargets,
    //     });
    //   },
  };

  #setTargets = async (data: ClickerTargetsConfig) => {
    return await Browser.storage.local.set({
      [StoredOptionsKeys.targets]: data,
    });
  };
}

export const appStorage = new ExtensionStorage() as AppData;
