import { randomUUID } from 'node:crypto'
import browser from 'webextension-polyfill'
import * as configModule from '../../../src/lib/models/config'
import { type Config } from '../../../src/lib/models/config'
import { ConfigStorage } from '../../../src/lib/storage/ConfigStorage'
import { _getConfig_, _getUrl_ } from '../models/utils'

describe('ConfigStorage', () => {
  let configStorage: ConfigStorage

  beforeEach(() => {
    configStorage = ConfigStorage.getInstance()
  })

  afterEach(() => {
    ConfigStorage['destroy']()
  })

  describe('addChangeListener', () => {
    const addListenerSpy = vi.spyOn(browser.storage.local.onChanged, 'addListener')

    it('adds a listener that invokes the provided callback when stored config changes', () => {
      const onChange = vi.fn()
      configStorage.addChangeListener('example', onChange)

      expect(onChange).not.toHaveBeenCalled()
      const listener = addListenerSpy.mock.calls[0][0]

      listener({})
      expect(onChange).not.toHaveBeenCalled()

      listener({ [ConfigStorage['StorageKey']]: {} })
      expect(onChange).not.toHaveBeenCalled()

      const config = _getConfig_(_getUrl_())
      listener({ [ConfigStorage['StorageKey']]: { newValue: config } })
      expect(onChange).toHaveBeenCalledExactlyOnceWith(config)
    })

    it('only adds a listener once when called with the same ID', () => {
      const listenerId = randomUUID()
      const onChange = vi.fn()
      configStorage.addChangeListener(listenerId, onChange)
      expect(addListenerSpy).toHaveBeenCalledOnce()

      configStorage.addChangeListener(listenerId, onChange)
      expect(addListenerSpy).toHaveBeenCalledOnce()

      configStorage.addChangeListener(randomUUID(), onChange)
      expect(addListenerSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('removeChangeListener', () => {
    const removeListenerSpy = vi.spyOn(browser.storage.local.onChanged, 'removeListener')

    it('does nothing when a listener was never added', () => {
      configStorage.removeChangeListener('example')

      expect(removeListenerSpy).not.toHaveBeenCalled()
    })

    it('removes a listener when it has been added before', () => {
      const listenerId = 'example'
      configStorage.addChangeListener(listenerId, vi.fn())

      expect(removeListenerSpy).not.toHaveBeenCalled()

      configStorage.removeChangeListener(listenerId)
      expect(removeListenerSpy).toHaveBeenCalled()
    })
  })
  describe('getConfig', () => {
    const storageLocalGetSpy = vi.spyOn(browser.storage.local, 'get')

    beforeEach(() => {
      storageLocalGetSpy.mockResolvedValue({})
    })

    it('returns empty object if nothing comes back from local storage', async () => {
      const config = await configStorage.getConfig()

      expect(storageLocalGetSpy).toHaveBeenCalledExactlyOnceWith(ConfigStorage['StorageKey'])
      expect(config).toStrictEqual({})
    })

    it('returns config data from local storage', async () => {
      const storedConfig = _getConfig_(_getUrl_())
      storageLocalGetSpy.mockResolvedValue({ [ConfigStorage['StorageKey']]: storedConfig })
      const config = await configStorage.getConfig()

      expect(storageLocalGetSpy).toHaveBeenCalledExactlyOnceWith(ConfigStorage['StorageKey'])
      expect(config).toStrictEqual(storedConfig)
    })

    it('throws if request to local storage throws', async () => {
      storageLocalGetSpy.mockRejectedValue('bad request')

      await expect(configStorage.getConfig()).rejects.toThrow('bad request')
    })
  })

  describe('setConfig', () => {
    const storageLocalSetSpy = vi.spyOn(browser.storage.local, 'set')
    const validateConfigSpy = vi.spyOn(configModule, 'validateConfig')
    let url: string
    let config: Config

    beforeEach(() => {
      storageLocalSetSpy.mockResolvedValue()
      url = _getUrl_()
      config = _getConfig_(url)
    })

    it('writes config data to local storage', async () => {
      await configStorage.setConfig(config)

      expect(validateConfigSpy).toHaveBeenCalledExactlyOnceWith(config, { throwOnError: true })
      expect(storageLocalSetSpy).toHaveBeenCalledExactlyOnceWith({
        [ConfigStorage['StorageKey']]: config
      })
    })

    it('throws if validation of config has errors', async () => {
      // @ts-expect-error
      delete config[url][0].targets

      await expect(configStorage.setConfig(config)).rejects.toThrow()
      expect(storageLocalSetSpy).not.toHaveBeenCalled()
    })

    it('throws if request to local storage throws', async () => {
      storageLocalSetSpy.mockRejectedValue('bad request')

      await expect(configStorage.setConfig(config)).rejects.toThrow('bad request')
      expect(storageLocalSetSpy).toHaveBeenCalledExactlyOnceWith({
        [ConfigStorage['StorageKey']]: config
      })
    })
  })
})
