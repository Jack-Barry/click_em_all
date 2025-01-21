import { randomUUID } from 'node:crypto'
import {
  ActionTargetStrategyType,
  type ActionSequence,
  type Config,
  type SequenceActionTarget
} from '../../../src/lib/models/config'

export function _getUrl_(): string {
  return 'https://some-website.com?a=something&b=something-else*'
}

export function _getSequenceTarget_(): SequenceActionTarget {
  return {
    name: `target-${randomUUID()}`,
    selector: `selector-${randomUUID()}`,
    strategy: ActionTargetStrategyType.clickAllFound
  }
}

export function _getSequence_(): ActionSequence {
  return {
    name: `sequence-${randomUUID()}`,
    targets: [_getSequenceTarget_()]
  }
}

export function _getConfig_(url: string): Config {
  return {
    [url]: [_getSequence_()]
  }
}
