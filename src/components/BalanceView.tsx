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
  onDeleteSettlement: (settlementId: string) => void
}

function getMemberName(members: Member[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? 'Unbekannt'
}

export function BalanceView({
  expenses,
  settlements,
  members,
  currentMemberId,
  currency,
  onSettle,
  onDeleteSettlement,
}: BalanceViewProps) {
  const memberIds = members.map((m) => m.id)
  const balances = computeBalances(expenses, settlements, memberIds)
  const debts = simplifyDebts(balances)

  return (
    <div className="space-y-6">
      {/* Net balances per person */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Salden
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
                    {isCurrentUser ? ' (du)' : ''}
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
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {balance > 0 && (isCurrentUser ? 'bekommst du' : 'bekommt zurück')}
                  {balance < 0 && (isCurrentUser ? 'schuldest du' : 'schuldet')}
                  {balance === 0 && 'ausgeglichen'}
                </p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Simplified debts */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Ausgleich nötig
        </h3>
        {debts.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-xl font-bold text-emerald-500">Alles ausgeglichen!</p>
            <p className="text-sm text-gray-400 mt-1.5">Keine offenen Schulden.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {debts.map((debt) => {
              const involvesCurrentUser =
                debt.from === currentMemberId || debt.to === currentMemberId
              const fromIsMe = debt.from === currentMemberId
              const toIsMe = debt.to === currentMemberId
              const fromName = getMemberName(members, debt.from)
              const toName = getMemberName(members, debt.to)

              let debtText: React.ReactNode
              if (fromIsMe) {
                debtText = <>Du schuldest <span className="font-semibold text-gray-700">{toName}</span></>
              } else if (toIsMe) {
                debtText = <><span className="font-semibold text-gray-700">{fromName}</span> schuldet dir</>
              } else {
                debtText = <><span className="font-semibold text-gray-700">{fromName}</span> schuldet <span className="font-semibold text-gray-700">{toName}</span></>
              }

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
                      {debtText}
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
                      Ausgleichen
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      {/* Past settlements */}
      {settlements.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Bisherige Ausgleiche
          </h3>
          <div className="space-y-2">
            {settlements.map((s) => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{getMemberName(members, s.from_member)}</span>
                    {' an '}
                    <span className="font-semibold">{getMemberName(members, s.to_member)}</span>
                    {' '}
                    <span className="font-bold text-gray-800">{formatCurrency(s.amount, currency)}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
                    onClick={() => onDeleteSettlement(s.id)}
                    aria-label="Ausgleich löschen"
                  >
                    Löschen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
