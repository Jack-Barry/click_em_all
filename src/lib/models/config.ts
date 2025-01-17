import { z } from 'zod'

export interface SchemaValidationError {
  path: (string | number)[]
  message?: string
}

export interface SchemaValidationResult {
  success: boolean
  error?: { errors: SchemaValidationError[] }
}

/** Strategy that can be used for a given `ClickerTarget` */
export enum ClickerTargetStrategyType {
  /** Click all targets immediately */
  allFound = 'allFound',
  /** Continue clicking first matching element while it is present on the page */
  whilePresent = 'whilePresent'
}

export const clickTargetSchema = z.object({
  /** Human readable name for the selector */
  name: z.string().min(1),
  /** Selector to use when searching for matching element(s) on page */
  selector: z.string().min(1),
  /** Strategy to use when clicking matching element(s) */
  strategy: z.nativeEnum(ClickerTargetStrategyType),
  /** Optional amount of time to wait between each click (in milliseconds) */
  timeBetweenMs: z.number().optional(),
  /** Optional max number of clicks to invoke before moving onto the next target */
  maxClicks: z.number().optional()
})

const clickSequenceSchema = z.object({
  /** Human readable name for the click sequence */
  name: z.string().min(1),
  /** Ordered list of targets to click for the click sequence */
  targets: z.array(clickTargetSchema)
})

const configSchema = z.record(
  z.string().url({ message: 'top level key must be valid URL' }),
  z.array(clickSequenceSchema)
)

/** Target to click */
export type ClickTarget = z.infer<typeof clickTargetSchema>

/** Sequence of targets to click */
export type ClickSequence = z.infer<typeof clickSequenceSchema>

/**
 * Configuration for the click 'em all application
 *
 * Each key in the config object is a URL representing a website where the user would
 * like to store clicking sequences to execute.
 *
 * Each clicking sequence consists of a series of targets to click
 */
export type Config = z.infer<typeof configSchema>

export function validateConfig(data: unknown): SchemaValidationResult {
  return configSchema.safeParse(data)
}
