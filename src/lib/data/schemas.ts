import { z } from "zod";
import { clickerTargetSchema } from "../Clicker/schemas";

/** Schema for a clicker target sequence */
export const clickerTargetSequenceSchema = z.object({
  /** Unique ID assigned to the sequence */
  id: z.string(),
  /** Name for the sequence, e.g. "Clip Coupons" */
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be a non-empty string"),
  /** An array of targets that will be sequentially clicked */
  targets: z.array(clickerTargetSchema),
});

/** Schema for all stored clicker target configuration */
export const clickerTargetsConfigSchema = z
  .object({})
  .catchall(z.array(clickerTargetSequenceSchema));

export const clickerTargetUrlSchema = z.string().min(2);
