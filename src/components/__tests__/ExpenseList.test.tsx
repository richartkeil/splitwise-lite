import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseList } from '@/components/ExpenseList'
import type { Expense, Member } from '@/lib/types'

const members: Member[] = [
  { id: 'member-1', group_id: 'group-1', name: 'Alice', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-2', group_id: 'group-1', name: 'Bob', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-3', group_id: 'group-1', name: 'Charlie', created_at: '2026-01-01T00:00:00Z' },
]

const expenses: Expense[] = [
  {
    id: 'expense-1',
    group_id: 'group-1',
    paid_by: 'member-1',
    description: 'Dinner',
    amount: 45,
    split_among: ['member-1', 'member-2', 'member-3'],
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'expense-2',
    group_id: 'group-1',
    paid_by: 'member-2',
    description: 'Groceries',
    amount: 30,
    split_among: ['member-1', 'member-2'],
    created_at: '2026-01-16T00:00:00Z',
  },
]

const defaultProps = {
  members,
  currentMemberId: 'member-1',
  currency: 'EUR',
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('ExpenseList', () => {
  it('shows empty message when there are no expenses', () => {
    render(<ExpenseList {...defaultProps} expenses={[]} />)
    expect(screen.getByText('Noch keine Ausgaben')).toBeInTheDocument()
  })

  it('renders expense descriptions and payer names', () => {
    render(<ExpenseList {...defaultProps} expenses={expenses} />)

    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    // member-1 is current user, so "Dinner" paid by "dir"
    expect(screen.getAllByText(/dir/i).length).toBeGreaterThan(0)
    // member-2 paid Groceries → shows "Bob"
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders expense amounts', () => {
    render(<ExpenseList {...defaultProps} expenses={expenses} />)

    // EUR formatted amounts
    expect(screen.getByText(/45/)).toBeInTheDocument()
    expect(screen.getByText(/30/)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<ExpenseList {...defaultProps} expenses={expenses} onEdit={onEdit} />)

    const editButtons = screen.getAllByRole('button', { name: /ausgabe bearbeiten/i })
    await user.click(editButtons[0])

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(expenses[0])
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<ExpenseList {...defaultProps} expenses={expenses} onDelete={onDelete} />)

    const deleteButtons = screen.getAllByRole('button', { name: /ausgabe löschen/i })
    await user.click(deleteButtons[1])

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('expense-2')
  })
})
