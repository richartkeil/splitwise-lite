import { useState, useRef, useEffect } from 'react'
import type { Expense, Member } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

type ExpenseListProps = {
  expenses: Expense[]
  members: Member[]
  currentMemberId: string
  currency: string
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
}

function getMemberName(members: Member[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? 'Unbekannt'
}

function formatSplitAmong(members: Member[], splitAmong: string[]): string {
  if (splitAmong.length === members.length) return 'alle'
  return splitAmong.map((id) => getMemberName(members, id)).join(', ')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function ExpenseMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all"
        aria-label="Aktionen"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 glass-strong rounded-xl shadow-fluent-lg py-1 min-w-[140px]">
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/60 transition-colors"
            aria-label="Ausgabe bearbeiten"
          >
            Bearbeiten
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 transition-colors"
            aria-label="Ausgabe löschen"
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  )
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
        <p className="text-lg font-semibold text-gray-400">Noch keine Ausgaben</p>
        <p className="text-sm mt-1.5 text-gray-400">Füge deine erste Ausgabe hinzu.</p>
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
                  Bezahlt von{' '}
                  <span className="font-semibold text-gray-600">
                    {paidByCurrentUser
                      ? 'dir'
                      : getMemberName(members, expense.paid_by)}
                  </span>
                  {' · '}
                  Aufgeteilt auf{' '}
                  <span className="font-semibold text-gray-600">
                    {formatSplitAmong(members, expense.split_among)}
                  </span>
                </p>
              </div>
              <ExpenseMenu
                onEdit={() => onEdit(expense)}
                onDelete={() => onDelete(expense.id)}
              />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
