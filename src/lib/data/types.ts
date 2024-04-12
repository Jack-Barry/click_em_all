import { z } from "zod";

import { type ClickerTarget } from "lib/Clicker/Clicker";

import type {
  clickerTargetSequenceSchema,
  clickerTargetsConfigSchema,
} from "./schemas";

/** Interface to interact with app's data */
export interface DataService {
  targets: {
    /** Retrieves all stored targets data */
    get: () => Promise<ClickerTargetsConfig>;
    /** Adds a new URL to targets data if it does not already exist */
    addUrl: (url: string) => Promise<void>;
    /** Removes all stored targets data for a given URL */
    removeUrl: (url: string) => Promise<void>;
    /** Moves data associated with a URL to a new destination */
    moveUrl: (oldUrl: string, newUrl: string) => Promise<void>;
    /** Adds a new target sequence for the specified URL */
    addSequence: (
      url: string,
      sequence: Omit<ClickerTargetsConfigTargetSequence, "id">
    ) => Promise<void>;
    /** Updates a target sequence */
    editSequence: (
      url: string,
      sequenceId: string,
      sequence: Omit<ClickerTargetsConfigTargetSequence, "id" | "targets">
    ) => Promise<void>;
    /** Removes a sequence from a URL */
    removeSequence: (url: string, sequenceId: string) => Promise<void>;
    /** Adds target to a given sequence */
    addTargetToSequence: (
      url: string,
      sequenceId: string,
      target: ClickerTarget
    ) => Promise<void>;
    /** Edits an existing target within a sequence */
    editTarget: (
      url: string,
      sequenceId: string,
      index: number,
      target: ClickerTarget
    ) => Promise<void>;
    /** Removes a target from a given sequence */
    removeTargetFromSequence: (
      url: string,
      sequenceId: string,
      index: number
    ) => Promise<void>;
  };
}

/** Group of targets for a given URL in `ClickerTargetsConfig` */
export type ClickerTargetsConfigTargetSequence = z.infer<
  typeof clickerTargetSequenceSchema
>;

/**
 * Configuration object used to keep track of user's click targets per website
 *
 * Each key is a URL where the targets are relevant
 */
export type ClickerTargetsConfig = z.infer<typeof clickerTargetsConfigSchema>;
