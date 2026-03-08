import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JoinGroupDialog } from '@/components/JoinGroupDialog'

const defaultProps = {
  open: true,
  groupName: 'Weekend Trip',
  onJoin: vi.fn(),
}

describe('JoinGroupDialog', () => {
  it('shows group name in dialog', () => {
    render(<JoinGroupDialog {...defaultProps} />)

    expect(screen.getByText('Join Weekend Trip')).toBeInTheDocument()
    expect(screen.getByText('Weekend Trip')).toBeInTheDocument()
  })

  it('has join button disabled when name is empty', () => {
    render(<JoinGroupDialog {...defaultProps} />)

    const joinButton = screen.getByRole('button', { name: /join/i })
    expect(joinButton).toBeDisabled()
  })

  it('does not call onJoin when submitting with empty name', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<JoinGroupDialog {...defaultProps} onJoin={onJoin} />)

    // Try submitting with spaces only
    const input = screen.getByLabelText('Your name')
    await user.type(input, '   ')
    // Button should still be disabled since trim() is empty
    const joinButton = screen.getByRole('button', { name: /join/i })
    expect(joinButton).toBeDisabled()
  })

  it('calls onJoin with trimmed name', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<JoinGroupDialog {...defaultProps} onJoin={onJoin} />)

    const input = screen.getByLabelText('Your name')
    await user.type(input, '  Alex  ')

    const joinButton = screen.getByRole('button', { name: /join/i })
    await user.click(joinButton)

    expect(onJoin).toHaveBeenCalledTimes(1)
    expect(onJoin).toHaveBeenCalledWith('Alex')
  })
})
