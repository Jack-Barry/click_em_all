import { formattedTimestamp } from '../../../src/lib/utils/date'

describe('utils: date', () => {
  describe('formattedTimestamp', () => {
    it('returns a nicely formatted timestamp', () => {
      const input = new Date('1999-12-31T23:59:59.999Z')
      expect(formattedTimestamp(input)).toBe('11:59:59.999')
    })
  })
})
