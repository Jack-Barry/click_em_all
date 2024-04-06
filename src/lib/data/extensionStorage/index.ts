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
  };
}

export const appStorage = new ExtensionStorage() as AppData;
