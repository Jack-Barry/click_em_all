import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import ConfigForm from '../../../src/lib/components/ConfigForm.svelte'
import { validateConfig, type Config } from '../../../src/lib/models/config'
import { ConfigStorage } from '../../../src/lib/storage/ConfigStorage'
import { prettyJson } from '../../../src/lib/utils/json'
import { _jsonAsTextInput_ } from '../../utils'
import { _getConfig_, _getUrl_ } from '../models/utils'

describe('ConfigForm', () => {
  let user: UserEvent
  let url: string
  let config: Config
  const getConfigSpy = vi.spyOn(ConfigStorage.prototype, 'getConfig')
  const setConfigSpy = vi.spyOn(ConfigStorage.prototype, 'setConfig')

  beforeEach(() => {
    user = userEvent.setup()
    url = _getUrl_()
    config = _getConfig_(url)
  })

  it('loads existing config if found in local storage', async () => {
    getConfigSpy.mockResolvedValue(config)

    render(ConfigForm)
    const textarea = getConfigTextInput()
    expect(getConfigSpy).toHaveBeenCalledOnce()
    await waitFor(() => expect(textarea).toHaveValue(prettyJson(config)))
  })

  it('allows submission when input is valid JSON', async () => {
    const user = userEvent.setup()
    render(ConfigForm)
    const textarea = getConfigTextInput()
    await user.clear(textarea)
    await user.type(textarea, '{{}')

    expect(getSubmitButton()).not.toBeDisabled()
  })

  it('allows submission when input is valid config', async () => {
    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)
    const configAsInput = _jsonAsTextInput_(config)
    await userEvent.type(textarea, configAsInput)

    expect(getSubmitButton()).not.toBeDisabled()
  })

  it('prevents submission when input is invalid JSON', async () => {
    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)
    await userEvent.type(textarea, '{{')
    expect(getSubmitButton()).toBeDisabled()
  })

  it('prevents submission when input is invalid config', async () => {
    // @ts-expect-error
    delete config[url][0].targets

    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)

    const configAsInput = _jsonAsTextInput_(config)
    await userEvent.type(textarea, configAsInput)

    expect(getSubmitButton()).toBeDisabled()
  })

  it('renders list of errors when input is invalid config', async () => {
    // @ts-expect-error
    delete config[url][0].targets
    const validationResult = validateConfig(config)

    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)

    const configAsInput = _jsonAsTextInput_(config)
    await userEvent.type(textarea, configAsInput)

    validationResult.error?.errors.forEach((err) => {
      const errorOnPage = screen.queryByText(`${JSON.stringify(err.path)}:${err.message}`)
      expect(errorOnPage).toBeInTheDocument()
    })
  })

  it('stores submitted config in local storage', async () => {
    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)
    const configAsInput = _jsonAsTextInput_(config)
    await userEvent.type(textarea, configAsInput)
    await userEvent.click(getSubmitButton())
    expect(setConfigSpy).toHaveBeenCalledExactlyOnceWith(config)
  })

  it('pretty formats JSON in input upon submit', async () => {
    render(ConfigForm)
    const textarea = getConfigTextInput()
    await userEvent.clear(textarea)
    const configAsInput = _jsonAsTextInput_(config)
    await userEvent.type(textarea, configAsInput)
    expect(textarea).toHaveValue(JSON.stringify(config))

    await userEvent.click(getSubmitButton())
    expect(textarea).not.toHaveValue(JSON.stringify(config))
    expect(textarea).toHaveValue(JSON.stringify(config, null, 2))
  })
})

function getConfigTextInput() {
  return screen.getByLabelText('Config', { selector: 'textarea' })
}

function getSubmitButton() {
  return screen.getByText('Save Config')
}
