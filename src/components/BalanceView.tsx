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
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Net Balances
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {members.map((member, index) => {
            const balance = Math.round((balances[member.id] ?? 0) * 100) / 100
            const isCurrentUser = member.id === currentMemberId

            return (
              <Card
                key={member.id}
                className={cn(
                  'p-4',
                  isCurrentUser && 'ring-1 ring-primary-200/60',
                )}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <p className={cn('text-sm truncate', isCurrentUser ? 'font-bold text-gray-800' : 'font-semibold text-gray-600')}>
                    {member.name}
                    {isCurrentUser ? ' (you)' : ''}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-lg font-bold',
                    balance > 0 && 'text-emerald-600',
                    balance < 0 && 'text-red-500',
                    balance === 0 && 'text-gray-300',
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
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Settlements Needed
        </h3>
        {debts.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-xl font-bold text-emerald-500">All settled up!</p>
            <p className="text-sm text-gray-400 mt-1.5">No outstanding debts.</p>
          </Card>
        ) : (
          <div className="space-y-3">
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
                    involvesCurrentUser && 'ring-1 ring-primary-200/60',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">{fromName}</span>
                      {' owes '}
                      <span className="font-semibold text-gray-700">{toName}</span>
                      {' '}
                      <span className="font-bold text-gray-800">
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
