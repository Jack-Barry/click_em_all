import { z } from 'zod'

export interface SchemaValidationOptions {
  /** Throw if validation yields any errors */
  throwOnError?: boolean
}

export interface SchemaValidationError {
  path: (string | number)[]
  message?: string
}

export interface SchemaValidationResult {
  success: boolean
  error?: { errors: SchemaValidationError[] }
}

/** Strategy that can be used for a given `ClickerTarget` */
export enum ActionTargetStrategyType {
  /** Click all targets immediately */
  clickAllFound = 'clickAllFound',
  /** Continue clicking first matching element while it is present on the page */
  clickWhilePresent = 'clickWhilePresent'
}

const actionTargetSchema = z.object({
  /** Human readable name for the selector */
  name: z.string().min(1),
  /** Selector to use when searching for matching element(s) on page */
  selector: z.string().min(1),
  /** Strategy to use when interacting with mattching element(s) */
  strategy: z.nativeEnum(ActionTargetStrategyType),
  /**
   * Optional amount of time to wait between each click (in milliseconds)
   *
   * @default 0
   */
  timeBetweenMs: z.number().optional(),
  /**
   * Optional max number of clicks to invoke before moving onto the next target
   *
   * @default 1000
   */
  maxClicks: z.number().optional()
})

const actionSequenceSchema = z.object({
  /** Human readable name for the click sequence */
  name: z.string().min(1),
  /** Ordered list of targets to interact with for the sequence */
  targets: z.array(actionTargetSchema)
})

const configSchema = z
  .record(
    z.string().url({ message: 'top level key must be valid URL' }),
    z.array(actionSequenceSchema)
  )
  .superRefine((config, ctx) => {
    Object.entries(config).forEach(([url, sequences]) => {
      const uniqueValues = new Map<string, number>()

      sequences.forEach((sequence, sequenceIndex) => {
        const firstAppearanceIndex = uniqueValues.get(sequence.name)
        if (firstAppearanceIndex !== undefined) {
          const indices = [sequenceIndex, firstAppearanceIndex]

          indices.forEach((index) => {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'name must be unique',
              path: [url, ...ctx.path, index, 'name']
            })
          })
        }
        uniqueValues.set(sequence.name, sequenceIndex)
      })
    })
  })

/** Target to click */
export type SequenceActionTarget = z.infer<typeof actionTargetSchema>

/** Sequence of targets to click */
export type ActionSequence = z.infer<typeof actionSequenceSchema>

/**
 * Configuration for the click 'em all application
 *
 * Each key in the config object is a URL representing a website where the user would
 * like to store action sequences to execute.
 *
 * Each action sequence consists of a series of targets to interact with, and how
 * to interact with them
 */
export type Config = z.infer<typeof configSchema>

export function validateConfig(
  data: unknown,
  options: SchemaValidationOptions = {}
): SchemaValidationResult {
  const validationResults = configSchema.safeParse(data)

  if (options.throwOnError && validationResults.error) {
    throw validationResults.error
  }

  return validationResults
}

export function getSequencesForUrl(config: Config, url: string) {
  const sequencesForUrl: ActionSequence[] = []

  Object.entries(config).forEach(([key, sequences]) => {
    if (url.startsWith(key)) {
      sequences.forEach((sequence) => {
        sequencesForUrl.push(sequence)
      })
    }
  })

  return sequencesForUrl
}
