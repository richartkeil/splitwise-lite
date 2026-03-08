import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalanceView } from '@/components/BalanceView'
import type { Expense, Settlement, Member } from '@/lib/types'

const members: Member[] = [
  { id: 'member-1', group_id: 'group-1', name: 'Alice', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-2', group_id: 'group-1', name: 'Bob', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-3', group_id: 'group-1', name: 'Charlie', created_at: '2026-01-01T00:00:00Z' },
]

const defaultProps = {
  members,
  currentMemberId: 'member-1',
  currency: 'EUR',
  onSettle: vi.fn(),
}

describe('BalanceView', () => {
  it('shows "All settled up" when there are no expenses', () => {
    render(
      <BalanceView
        {...defaultProps}
        expenses={[]}
        settlements={[]}
      />,
    )

    expect(screen.getByText('Alles ausgeglichen!')).toBeInTheDocument()
  })

  it('shows debt information when there are expenses', () => {
    const expenses: Expense[] = [
      {
        id: 'expense-1',
        group_id: 'group-1',
        paid_by: 'member-1',
        description: 'Dinner',
        amount: 30,
        split_among: ['member-1', 'member-2', 'member-3'],
        created_at: '2026-01-15T00:00:00Z',
      },
    ]

    render(
      <BalanceView
        {...defaultProps}
        expenses={expenses}
        settlements={[]}
      />,
    )

    // Should show owes text for the debts
    expect(screen.getAllByText(/schuldet/i).length).toBeGreaterThan(0)
    // Bob and Charlie appear in the view (in balances and debts sections)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0)
  })

  it('calls onSettle with correct args when Settle button is clicked', async () => {
    const user = userEvent.setup()
    const onSettle = vi.fn()

    const expenses: Expense[] = [
      {
        id: 'expense-1',
        group_id: 'group-1',
        paid_by: 'member-1',
        description: 'Dinner',
        amount: 30,
        split_among: ['member-1', 'member-2', 'member-3'],
        created_at: '2026-01-15T00:00:00Z',
      },
    ]

    render(
      <BalanceView
        {...defaultProps}
        expenses={expenses}
        settlements={[]}
        onSettle={onSettle}
      />,
    )

    const settleButtons = screen.getAllByRole('button', { name: /ausgleichen/i })
    await user.click(settleButtons[0])

    expect(onSettle).toHaveBeenCalledTimes(1)
    // Should be called with (from, to, amount)
    const [from, to, amount] = onSettle.mock.calls[0]
    expect(typeof from).toBe('string')
    expect(typeof to).toBe('string')
    expect(amount).toBeCloseTo(10)
  })
})
