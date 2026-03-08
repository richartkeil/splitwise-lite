import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '@/components/ExpenseForm'
import type { Member } from '@/lib/types'

const members: Member[] = [
  { id: 'member-1', group_id: 'group-1', name: 'Alice', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-2', group_id: 'group-1', name: 'Bob', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-3', group_id: 'group-1', name: 'Charlie', created_at: '2026-01-01T00:00:00Z' },
]

const defaultProps = {
  members,
  currentMemberId: 'member-1',
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

describe('ExpenseForm', () => {
  it('renders with current user selected as payer and all members checked', () => {
    render(<ExpenseForm {...defaultProps} />)

    // Payer select should default to current user
    const payerSelect = screen.getByLabelText('Paid by') as HTMLSelectElement
    expect(payerSelect.value).toBe('member-1')

    // All member checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(3)
    for (const checkbox of checkboxes) {
      expect(checkbox).toBeChecked()
    }
  })

  it('submits with valid data and calls onSubmit with correct data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExpenseForm {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Description'), 'Lunch')
    await user.type(screen.getByLabelText('Amount'), '24.50')

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Lunch',
      amount: 24.5,
      paid_by: 'member-1',
      split_among: ['member-1', 'member-2', 'member-3'],
    })
  })

  it('does not submit with empty description', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExpenseForm {...defaultProps} onSubmit={onSubmit} />)

    // Only fill amount, leave description empty
    await user.type(screen.getByLabelText('Amount'), '10')

    const submitButton = screen.getByRole('button', { name: /add expense/i })
    expect(submitButton).toBeDisabled()

    await user.click(submitButton)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ExpenseForm {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
