import { randomUUID } from 'node:crypto'
import {
  ActionTargetStrategyType,
  type ActionSequence,
  type Config
} from '../../../src/lib/models/config'

export function _getUrl_(): string {
  return 'https://some-website.com?a=something&b=something-else*'
}

export function _getSequence_(): ActionSequence {
  return {
    name: `sequence-${randomUUID()}`,
    targets: [
      {
        name: `target-${randomUUID()}`,
        selector: `selector-${randomUUID()}`,
        strategy: ActionTargetStrategyType.clickAllFound
      }
    ]
  }
}

export function _getConfig_(url: string): Config {
  return {
    [url]: [_getSequence_()]
  }
}
