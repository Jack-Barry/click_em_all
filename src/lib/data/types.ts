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
    // /**
    //  * Adds a new targets group for the specified URL
    //  *
    //  * @returns Unique ID assigned to the new group
    //  */
    // addGroup: (
    //   url: string,
    //   group: Omit<ClickerTargetsConfigTargetGroup, "id">
    // ) => Promise<{ id: string }>;
    // /**
    //  * Fetches groups for a given URL
    //  */
    // getGroups: (url: string) => Promise<ClickerTargetsConfigTargetGroup[]>;
    // /** Edits target group data */
    // editGroup: (
    //   url: string,
    //   groupId: string,
    //   data: Partial<Omit<ClickerTargetsConfigTargetGroup, "id">>
    // ) => Promise<void>;
    // /** Removes target group data */
    // removeGroup: (url: string, groupId: string) => Promise<void>;
  };
}

/**
 * Configuration object used to keep track of user's click targets per website
 *
 * Each key is a URL where the targets are relevant
 */
export type ClickerTargetsConfig = Record<
  string,
  ClickerTargetsConfigTargetGroup[]
>;

/** Group of targets for a given URL in `ClickerTargetsConfig` */
export interface ClickerTargetsConfigTargetGroup {
  /** Unique ID assigned to the target group */
  id: string;
  /** Name for the targets group, e.g. "Clip Coupons" */
  name: string;
  /** An array of targets that will be sequentially clicked */
  targets: ClickerTargetsConfigTargetGroupTarget[];
}

/** Target config within a `ClickerTargetsConfigTargetGroup` */
export interface ClickerTargetsConfigTargetGroupTarget {
  /** Name for the selector, e.g. "Load More" */
  name: string;
  /** Selector to use when searchng for matching element(s) on page */
  selector: string;
  /** Strategy to use when clicking matching element(s) */
  strategy: ClickerTargetStrategyType;
  /** Optional max number of clicks to invoke before moving onto the next target */
  maxClicks?: number;
}
