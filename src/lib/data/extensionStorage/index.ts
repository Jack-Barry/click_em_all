import Browser from "webextension-polyfill";
import type { AppData, ClickerTargetsConfig } from "../types";
import { StoredOptionsKeys } from "./constants";

/** `AppData` implemented by interacting with extension storage */
class ExtensionStorage implements AppData {
  targets = {
    get: async () => {
      return (await Browser.storage.local.get(
        StoredOptionsKeys.targets
      )) as ClickerTargetsConfig;
    },
  };
}

export const appStorage = new ExtensionStorage();
