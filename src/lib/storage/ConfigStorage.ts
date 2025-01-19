import browser from 'webextension-polyfill'
import { validateConfig, type Config } from '../models/config'

type StorageListener = Parameters<typeof browser.storage.local.onChanged.addListener>[0]

export class ConfigStorage {
  private static StorageKey = 'config'
  private static instance: ConfigStorage
  private static changeListeners: Record<string, StorageListener> = {}

  private constructor() {}

  static getInstance() {
    if (!ConfigStorage.instance) {
      ConfigStorage.instance = new ConfigStorage()
    }

    return ConfigStorage.instance
  }

  /** For unit testing purposes only */
  protected static destroy() {
    //@ts-expect-error
    ConfigStorage.instance = null
  }

  addChangeListener(id: string, onChange: (config: Config) => void) {
    if (ConfigStorage.changeListeners[id] !== undefined) {
      return
    }

    const listener: StorageListener = (changes) => {
      const updatedConfig = changes[ConfigStorage.StorageKey]?.newValue
      if (!updatedConfig) {
        return
      }

      onChange(updatedConfig)
    }
    browser.storage.local.onChanged.addListener(listener)
    ConfigStorage.changeListeners[id] = listener
  }

  removeChangeListener(id: string) {
    const listener = ConfigStorage.changeListeners[id]
    if (listener === undefined) {
      return
    }

    browser.storage.local.onChanged.removeListener(listener)
    delete ConfigStorage.changeListeners[id]
  }

  async getConfig() {
    const data = await browser.storage.local.get(ConfigStorage.StorageKey)
    return (data.config || {}) as Config
  }

  async setConfig(config: Config) {
    validateConfig(config, { throwOnError: true })
    await browser.storage.local.set({ [ConfigStorage.StorageKey]: config })
  }
}
