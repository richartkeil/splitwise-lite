import type { Expense, Settlement, Member } from '@/lib/types'
import { computeBalances, simplifyDebts } from '@/lib/balance'
import { cn, formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type BalanceViewProps = {
  expenses: Expense[]
  settlements: Settlement[]
  members: Member[]
  currentMemberId: string
  currency: string
  onSettle: (from: string, to: string, amount: number) => void
}

function getMemberName(members: Member[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? 'Unknown'
}

export function BalanceView({
  expenses,
  settlements,
  members,
  currentMemberId,
  currency,
  onSettle,
}: BalanceViewProps) {
  const balances = computeBalances(expenses, settlements)
  const debts = simplifyDebts(balances)

  return (
    <div className="space-y-6">
      {/* Net balances per person */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Net Balances
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {members.map((member) => {
            const balance = Math.round((balances[member.id] ?? 0) * 100) / 100
            const isCurrentUser = member.id === currentMemberId

            return (
              <Card
                key={member.id}
                className={cn(
                  'p-3',
                  isCurrentUser && 'border-primary-200',
                )}
              >
                <p className={cn('text-sm', isCurrentUser ? 'font-semibold' : 'font-medium')}>
                  {member.name}
                  {isCurrentUser ? ' (you)' : ''}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold mt-0.5',
                    balance > 0 && 'text-green-600',
                    balance < 0 && 'text-red-600',
                    balance === 0 && 'text-gray-400',
                  )}
                >
                  {balance > 0 && '+'}
                  {formatCurrency(Math.abs(balance), currency)}
                  {balance < 0 && ' owed'}
                  {balance > 0 && ' owed to'}
                </p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Simplified debts */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Settlements Needed
        </h3>
        {debts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-lg font-medium text-green-600">All settled up!</p>
            <p className="text-sm text-gray-500 mt-1">No outstanding debts.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {debts.map((debt) => {
              const involvesCurrentUser =
                debt.from === currentMemberId || debt.to === currentMemberId
              const fromName =
                debt.from === currentMemberId
                  ? 'You'
                  : getMemberName(members, debt.from)
              const toName =
                debt.to === currentMemberId
                  ? 'you'
                  : getMemberName(members, debt.to)

              return (
                <Card
                  key={`${debt.from}-${debt.to}`}
                  className={cn(
                    'p-4',
                    involvesCurrentUser && 'border-primary-200 bg-primary-50/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-medium">{fromName}</span>
                      {' owes '}
                      <span className="font-medium">{toName}</span>
                      {' '}
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(debt.amount, currency)}
                      </span>
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSettle(debt.from, debt.to, debt.amount)}
                    >
                      Settle
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
