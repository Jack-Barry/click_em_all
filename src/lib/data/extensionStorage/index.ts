import Browser from "webextension-polyfill";
import type {
  DataService,
  ClickerTargetsConfig,
  ClickerTargetsConfigTargetSequence,
} from "../types";
import type { ClickerTarget } from "../../Clicker/Clicker";

/** `AppData` implemented by interacting with extension storage */
export class ExtensionStorage implements DataService {
  static STORAGE_KEYS = {
    TARGETS: "targets",
  };

  targets = {
    get: async () => {
      const allData =
        (await Browser.storage.local.get(
          ExtensionStorage.STORAGE_KEYS.TARGETS
        )) || {};
      return (allData[ExtensionStorage.STORAGE_KEYS.TARGETS] ||
        {}) as ClickerTargetsConfig;
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
      target: ClickerTarget
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

    editTarget: async (
      url: string,
      sequenceId: string,
      index: number,
      target: Partial<ClickerTarget>
    ) => {
      const data = await this.targets.get();
      const sequenceIndex = data[url].findIndex((v) => v.id === sequenceId);
      const existingTarget = data[url][sequenceIndex].targets[index];
      data[url] = [
        ...data[url].slice(0, sequenceIndex),
        {
          ...data[url][sequenceIndex],
          targets: [
            ...data[url][sequenceIndex].targets.slice(0, index),
            { ...existingTarget, ...target },
            ...data[url][sequenceIndex].targets.slice(index + 1),
          ],
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
      [ExtensionStorage.STORAGE_KEYS.TARGETS]: data,
    });
  };
}

export const appStorage = new ExtensionStorage();
