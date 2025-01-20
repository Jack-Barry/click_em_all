import { Logging } from '../../../src/lib/utils/Logging'

describe('utils: Logging', () => {
  describe('info', () => {
    const consoleLogSpy = vi.spyOn(console, 'log')

    it('logs prefixed message to console', () => {
      Logging.info('stuff', 'happened')
      expect(consoleLogSpy).toHaveBeenCalledExactlyOnceWith(
        Logging['messagePrefix'],
        'INFO:',
        'stuff',
        'happened'
      )
    })
  })

  describe('debug', () => {
    const consoleDebugSpy = vi.spyOn(console, 'debug')

    it('logs prefixed message to console', () => {
      Logging.debug('trivial', 'stuff', 'happened')
      expect(consoleDebugSpy).toHaveBeenCalledExactlyOnceWith(
        Logging['messagePrefix'],
        'DEBUG:',
        'trivial',
        'stuff',
        'happened'
      )
    })
  })

  describe('error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')

    it('logs prefixed message to console', () => {
      Logging.error('bad', 'stuff', 'happened')
      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
        Logging['messagePrefix'],
        'ERROR:',
        'bad',
        'stuff',
        'happened'
      )
    })
  })
})
