import {
  ClickerTargetStrategyType,
  validateConfig,
  type Config,
  type SchemaValidationError,
  type SchemaValidationResult
} from '../../../src/lib/models/config'
import { _getConfig_, _getUrl_ } from './utils'

describe('validateConfig', () => {
  let validUrl: string
  let testConfig: Config

  beforeEach(() => {
    validUrl = _getUrl_()
    testConfig = _getConfig_(validUrl)
  })

  it('allows valid config through', () => {
    const result = validateConfig(testConfig)
    expect(result.success).toBe(true)
  })

  it('has error when value for a given URL is undefined', () => {
    const result = validateConfig({ [validUrl]: undefined })
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl],
      message: 'Required'
    })
  })

  it('has error when value for a given URL is invalid type', () => {
    let result = validateConfig({ [validUrl]: {} })
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl],
      message: 'Expected array, received object'
    })

    result = validateConfig({ [validUrl]: '' })
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl],
      message: 'Expected array, received string'
    })

    result = validateConfig({ [validUrl]: 0 })
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl],
      message: 'Expected array, received number'
    })

    result = validateConfig({ [validUrl]: null })
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl],
      message: 'Expected array, received null'
    })
  })

  it('has error when key is invalid URL', () => {
    const result = validateConfig({ invalidUrl: [] })
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: ['invalidUrl'],
      message: 'top level key must be valid URL'
    })
  })

  it('has error when name is missing for click sequence', () => {
    // @ts-expect-error
    delete testConfig[validUrl][0].name
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'name'],
      message: 'Required'
    })
  })

  it('has error when name is too short for click sequence', () => {
    testConfig[validUrl][0].name = ''
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'name'],
      message: 'String must contain at least 1 character'
    })
  })

  it('has error when targets is missing from click sequence', () => {
    // @ts-expect-error
    delete testConfig[validUrl][0].targets
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets'],
      message: 'Required'
    })
  })

  it('has error when targets for click sequence is invalid type', () => {
    // @ts-expect-error
    testConfig[validUrl][0].targets = {}
    let result = validateConfig(testConfig)
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets'],
      message: 'Expected array, received object'
    })

    // @ts-expect-error
    testConfig[validUrl][0].targets = ''
    result = validateConfig(testConfig)
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets'],
      message: 'Expected array, received string'
    })

    // @ts-expect-error
    testConfig[validUrl][0].targets = 0
    result = validateConfig(testConfig)
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets'],
      message: 'Expected array, received number'
    })

    // @ts-expect-error
    testConfig[validUrl][0].targets = null
    result = validateConfig(testConfig)
    expect(result.success).toBe(false)
    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets'],
      message: 'Expected array, received null'
    })
  })

  it('has error when name for a click target is missing', () => {
    // @ts-expect-error
    delete testConfig[validUrl][0].targets[0].name
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'name'],
      message: 'Required'
    })
  })

  it('has error when name for a click target is too short', () => {
    testConfig[validUrl][0].targets[0].name = ''
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'name'],
      message: 'String must contain at least 1 character'
    })
  })

  it('has error when selector for a click target is missing', () => {
    // @ts-expect-error
    delete testConfig[validUrl][0].targets[0].selector
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'selector'],
      message: 'Required'
    })
  })

  it('has error when selector for a click target is too short', () => {
    testConfig[validUrl][0].targets[0].selector = ''
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'selector'],
      message: 'String must contain at least 1 character'
    })
  })

  it('has error when a click target is missing strategy', () => {
    // @ts-expect-error
    delete testConfig[validUrl][0].targets[0].strategy
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'strategy'],
      message: 'Required'
    })
  })

  it('allows all supported strategy values', () => {
    for (const strategy of Object.values(ClickerTargetStrategyType)) {
      testConfig[validUrl][0].targets[0].strategy = strategy
      const result = validateConfig(testConfig)
      expect(result.success, `allows strategy: ${strategy}`).toBe(true)
    }
  })

  it('has error when strategy for a click target is invalid', () => {
    // @ts-expect-error
    testConfig[validUrl][0].targets[0].strategy = 'invalid'
    const result = validateConfig(testConfig)
    expect(result.success).toBe(false)

    assertAttributesOnError(result, {
      path: [validUrl, 0, 'targets', 0, 'strategy'],
      message: 'Invalid enum value'
    })
  })

  it('allows for a click target to specify timeBetweenMs', () => {
    testConfig[validUrl][0].targets[0].timeBetweenMs = 1000
    const result = validateConfig(testConfig)
    expect(result.success).toBe(true)
  })

  it('allows for a click target to specify maxClicks', () => {
    testConfig[validUrl][0].targets[0].maxClicks = 1000
    const result = validateConfig(testConfig)
    expect(result.success).toBe(true)
  })
})

function assertAttributesOnError(
  result: SchemaValidationResult,
  expectedAttributes: Required<SchemaValidationError> & { length?: number },
  index = 0
) {
  const errors = result.error!.errors
  expect(errors).toHaveLength(expectedAttributes.length ?? 1)
  expect(errors[index].path).toStrictEqual(expectedAttributes.path)
  expect(errors[index].message).toMatch(new RegExp(`^${expectedAttributes.message}`))
}
