import type { ClickerTargetStrategyType } from "../Clicker/Clicker";

/** Interface to interact with app's data */
export interface AppData {
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
      target: ClickerTargetsConfigTargetSequenceTarget
    ) => Promise<void>;
    /** Removes a target from a given sequence */
    removeTargetFromSequence: (
      url: string,
      sequenceId: string,
      index: number
    ) => Promise<void>;
  };
}

/**
 * Configuration object used to keep track of user's click targets per website
 *
 * Each key is a URL where the targets are relevant
 */
export type ClickerTargetsConfig = Record<
  string,
  ClickerTargetsConfigTargetSequence[]
>;

/** Group of targets for a given URL in `ClickerTargetsConfig` */
export interface ClickerTargetsConfigTargetSequence {
  /** Unique ID assigned to the target group */
  id: string;
  /** Name for the targets group, e.g. "Clip Coupons" */
  name: string;
  /** An array of targets that will be sequentially clicked */
  targets: ClickerTargetsConfigTargetSequenceTarget[];
}

/** Target config within a `ClickerTargetsConfigTargetGroup` */
export interface ClickerTargetsConfigTargetSequenceTarget {
  /** Name for the selector, e.g. "Load More" */
  name: string;
  /** Selector to use when searchng for matching element(s) on page */
  selector: string;
  /** Strategy to use when clicking matching element(s) */
  strategy: ClickerTargetStrategyType;
  /** Optional max number of clicks to invoke before moving onto the next target */
  maxClicks?: number;
}
