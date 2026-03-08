import type { Expense, Member } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type ExpenseListProps = {
  expenses: Expense[]
  members: Member[]
  currentMemberId: string
  currency: string
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
}

function getMemberName(members: Member[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? 'Unknown'
}

function formatSplitAmong(members: Member[], splitAmong: string[]): string {
  if (splitAmong.length === members.length) return 'everyone'
  return splitAmong.map((id) => getMemberName(members, id)).join(', ')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function ExpenseList({
  expenses,
  members,
  currentMemberId,
  currency,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No expenses yet</p>
        <p className="text-sm mt-1">Add your first expense to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const paidByCurrentUser = expense.paid_by === currentMemberId

        return (
          <Card
            key={expense.id}
            className={cn(
              'p-4',
              paidByCurrentUser && 'border-primary-200 bg-primary-50/30',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {expense.description}
                  </h4>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDate(expense.created_at)}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {formatCurrency(expense.amount, currency)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Paid by{' '}
                  <span className="font-medium">
                    {paidByCurrentUser
                      ? 'you'
                      : getMemberName(members, expense.paid_by)}
                  </span>
                  {' · '}
                  Split among{' '}
                  <span className="font-medium">
                    {formatSplitAmong(members, expense.split_among)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  aria-label="Edit expense"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(expense.id)}
                  aria-label="Delete expense"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
