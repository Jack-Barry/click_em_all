import type { ClickerTargetStrategyType } from "../Clicker/Clicker";

/** Interface to interact with app's data */
export interface AppData {
  targets: {
    get: () => Promise<ClickerTargetsConfig>;
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
