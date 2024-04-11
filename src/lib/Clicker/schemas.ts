import { z } from "zod";

/** Strategy that can be used for a given `ClickerTarget` */
export enum ClickerTargetStrategyType {
  /** Click all targets immediately once found */
  allFound = "allFound",
  /** Click first element matching target while it is still present on the page */
  whilePresent = "whilePresent",
}

export const clickerTargetSchema = z.object({
  /** Name for the selector, e.g. "Load More" */
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters long"),
  /** Selector to use when searchng for matching element(s) on page */
  selector: z
    .string({ required_error: "An element selector must be specified" })
    .min(1, "Selector must be a non-empty string"),
  /** Strategy to use when clicking matching element(s) */
  strategy: z.nativeEnum(ClickerTargetStrategyType),
  /** Optional max number of clicks to invoke before moving onto the next target */
  maxClicks: z.number().optional(),
});
