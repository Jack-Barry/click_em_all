import Browser from "webextension-polyfill";
import type {
  AppData,
  ClickerTargetsConfig,
  ClickerTargetsConfigTargetSequence,
  ClickerTargetsConfigTargetSequenceTarget,
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

    addSequence: async (
      url: string,
      group: Omit<ClickerTargetsConfigTargetSequence, "id">
    ) => {
      const data = await this.targets.get();
      const id = crypto.randomUUID();
      data[url] = [...(data[url] || []), { ...group, id }];
      await this.#setTargets(data);
    },

    editSequence: async (
      url: string,
      sequenceId: string,
      sequence: Partial<
        Omit<ClickerTargetsConfigTargetSequence, "id" | "targets">
      >
    ) => {
      const data = await this.targets.get();
      const sequenceIndex = data[url].findIndex((v) => v.id === sequenceId);
      data[url] = [
        ...data[url].slice(0, sequenceIndex),
        { ...data[url][sequenceIndex], ...sequence },
        ...data[url].slice(sequenceIndex + 1),
      ];
      await this.#setTargets(data);
    },

    removeSequence: async (url: string, sequenceId: string) => {
      const data = await this.targets.get();
      const sequenceIndex = data[url].findIndex((v) => v.id === sequenceId);
      data[url] = [
        ...data[url].slice(0, sequenceIndex),
        ...data[url].slice(sequenceIndex + 1),
      ];

      await this.#setTargets(data);
    },

    addTargetToSequence: async (
      url: string,
      sequenceId: string,
      target: ClickerTargetsConfigTargetSequenceTarget
    ) => {
      const data = await this.targets.get();
      const sequenceIndex = data[url].findIndex((v) => v.id === sequenceId);
      data[url] = [
        ...data[url].slice(0, sequenceIndex),
        {
          ...data[url][sequenceIndex],
          targets: [...data[url][sequenceIndex].targets, target],
        },
        ...data[url].slice(sequenceIndex + 1),
      ];
      await this.#setTargets(data);
    },

    removeTargetFromSequence: async (
      url: string,
      sequenceId: string,
      targetIndex: number
    ) => {
      const data = await this.targets.get();
      const sequenceIndex = data[url].findIndex((v) => v.id === sequenceId);
      data[url] = [
        ...data[url].slice(0, sequenceIndex),
        {
          ...data[url][sequenceIndex],
          targets: [
            ...data[url][sequenceIndex].targets.slice(0, targetIndex),
            ...data[url][sequenceIndex].targets.slice(targetIndex + 1),
          ],
        },
        ...data[url].slice(sequenceIndex + 1),
      ];
      await this.#setTargets(data);
    },
  };

  #setTargets = async (data: ClickerTargetsConfig) => {
    return await Browser.storage.local.set({
      [StoredOptionsKeys.targets]: data,
    });
  };
}

export const appStorage = new ExtensionStorage() as AppData;
