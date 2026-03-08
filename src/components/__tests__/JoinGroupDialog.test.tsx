import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JoinGroupDialog } from '@/components/JoinGroupDialog'
import type { Member } from '@/lib/types'

const members: Member[] = [
  { id: 'member-1', group_id: 'group-1', name: 'Alice', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-2', group_id: 'group-1', name: 'Bob', created_at: '2026-01-01T00:00:00Z' },
]

const defaultProps = {
  open: true,
  groupName: 'Weekend Trip',
  members: [] as Member[],
  onJoin: vi.fn(),
  onClaim: vi.fn(),
}

describe('JoinGroupDialog', () => {
  it('shows group name in dialog', () => {
    render(<JoinGroupDialog {...defaultProps} />)

    expect(screen.getByText('Weekend Trip beitreten')).toBeInTheDocument()
    expect(screen.getByText('Weekend Trip')).toBeInTheDocument()
  })

  it('has join button disabled when name is empty', () => {
    render(<JoinGroupDialog {...defaultProps} />)

    const joinButton = screen.getByRole('button', { name: /beitreten/i })
    expect(joinButton).toBeDisabled()
  })

  it('does not call onJoin when submitting with empty name', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<JoinGroupDialog {...defaultProps} onJoin={onJoin} />)

    const input = screen.getByLabelText('Dein Name')
    await user.type(input, '   ')
    const joinButton = screen.getByRole('button', { name: /beitreten/i })
    expect(joinButton).toBeDisabled()
  })

  it('calls onJoin with trimmed name', async () => {
    const user = userEvent.setup()
    const onJoin = vi.fn()
    render(<JoinGroupDialog {...defaultProps} onJoin={onJoin} />)

    const input = screen.getByLabelText('Dein Name')
    await user.type(input, '  Alex  ')

    const joinButton = screen.getByRole('button', { name: /beitreten/i })
    await user.click(joinButton)

    expect(onJoin).toHaveBeenCalledTimes(1)
    expect(onJoin).toHaveBeenCalledWith('Alex')
  })

  it('shows existing members and new form together', () => {
    render(<JoinGroupDialog {...defaultProps} members={members} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText(/oder neu/)).toBeInTheDocument()
    expect(screen.getByLabelText('Dein Name')).toBeInTheDocument()
  })

  it('calls onClaim when clicking an existing member', async () => {
    const user = userEvent.setup()
    const onClaim = vi.fn()
    render(<JoinGroupDialog {...defaultProps} members={members} onClaim={onClaim} />)

    await user.click(screen.getByText('Alice'))

    expect(onClaim).toHaveBeenCalledWith('member-1')
  })
})
