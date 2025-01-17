import { randomUUID } from 'node:crypto'
import { ClickerTargetStrategyType, type Config } from '../../../src/lib/models/config'

export function _getUrl_(): string {
  return 'https://some-website.com?a=something&b=something-else*'
}

export function _getConfig_(url: string): Config {
  return {
    [url]: [
      {
        name: `sequence-${randomUUID()}`,
        targets: [
          {
            name: `target-${randomUUID()}`,
            selector: `selector-${randomUUID()}`,
            strategy: ClickerTargetStrategyType.allFound
          }
        ]
      }
    ]
  }
}
