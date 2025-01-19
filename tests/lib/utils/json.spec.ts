import { prettyJson } from '../../../src/lib/utils/json'

describe('utils: json', () => {
  describe('prettyJson', () => {
    it('returns pretty formatted JSON', () => {
      expect(prettyJson({ hello: 'world' })).toBe('{\n  "hello": "world"\n}')
    })
  })
})
