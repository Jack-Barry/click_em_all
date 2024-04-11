import { z } from "zod";
import { clickerTargetSchema } from "../Clicker/schemas";

/** Schema for a clicker target sequence */
export const clickerTargetSequenceSchema = z.object({
  /** Unique ID assigned to the target group */
  id: z.string(),
  /** Name for the targets group, e.g. "Clip Coupons" */
  name: z.string(),
  /** An array of targets that will be sequentially clicked */
  targets: z.array(clickerTargetSchema),
});

/** Schema for all stored clicker target configuration */
export const clickerTargetsConfigSchema = z
  .object({})
  .catchall(z.array(clickerTargetSequenceSchema));
