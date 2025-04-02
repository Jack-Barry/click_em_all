import { render, screen } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { browser } from 'wxt/browser'
import OpenOptionsPageButton from '../../../src/lib/components/OpenOptionsPageButton.svelte'

describe('OpenOptionPageButton', () => {
  it('opens the options page when clicked', async () => {
    const openOptionsPage = vi.spyOn(browser.runtime, 'openOptionsPage')
    render(OpenOptionsPageButton)

    const openOptionsPageButton = screen.getByText('Extension Options')
    await userEvent.click(openOptionsPageButton)
    expect(openOptionsPage).toHaveBeenCalledOnce()
  })
})
