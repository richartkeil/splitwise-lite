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
      <Card className="text-center py-14">
        <p className="text-lg font-semibold text-gray-400">No expenses yet</p>
        <p className="text-sm mt-1.5 text-gray-400">Add your first expense to get started.</p>
      </Card>
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
              paidByCurrentUser && 'ring-1 ring-primary-200/60',
            )}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {expense.description}
                  </h4>
                  <span className="text-xs text-gray-400 shrink-0 font-medium">
                    {formatDate(expense.created_at)}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800 mt-0.5">
                  {formatCurrency(expense.amount, currency)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Paid by{' '}
                  <span className="font-semibold text-gray-600">
                    {paidByCurrentUser
                      ? 'you'
                      : getMemberName(members, expense.paid_by)}
                  </span>
                  {' · '}
                  Split among{' '}
                  <span className="font-semibold text-gray-600">
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
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
