import { render, screen } from '@testing-library/svelte'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import ConfigForm from '../../../src/lib/components/ConfigForm.svelte'
import { validateConfig, type Config } from '../../../src/lib/models/config'
import { _jsonAsTextInput_ } from '../../utils'
import { _getConfig_, _getUrl_ } from '../models/utils'

describe('ConfigForm', () => {
  let user: UserEvent
  let url: string
  let config: Config

  beforeEach(() => {
    user = userEvent.setup()
    url = _getUrl_()
    config = _getConfig_(url)
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
})

function getConfigTextInput() {
  return screen.getByLabelText('Config', { selector: 'textarea' })
}

function getSubmitButton() {
  return screen.getByText('Save Config')
}
