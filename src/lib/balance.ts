import type { Expense, Settlement } from './types'

export function computeBalances(
  expenses: Expense[],
  settlements: Settlement[]
): Record<string, number> {
  const balances: Record<string, number> = {}

  for (const expense of expenses) {
    const share = expense.amount / expense.split_among.length

    // The payer is owed money
    balances[expense.paid_by] = (balances[expense.paid_by] ?? 0) + expense.amount

    // Each participant owes their share
    for (const memberId of expense.split_among) {
      balances[memberId] = (balances[memberId] ?? 0) - share
    }
  }

  for (const settlement of settlements) {
    // from_member paid to_member, so from_member's balance goes up, to_member's goes down
    balances[settlement.from_member] = (balances[settlement.from_member] ?? 0) + settlement.amount
    balances[settlement.to_member] = (balances[settlement.to_member] ?? 0) - settlement.amount
  }

  return balances
}

export function simplifyDebts(
  balances: Record<string, number>
): { from: string; to: string; amount: number }[] {
  const debtors: { id: string; amount: number }[] = []
  const creditors: { id: string; amount: number }[] = []

  for (const [id, balance] of Object.entries(balances)) {
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(balance * 100) / 100
    if (rounded < 0) {
      debtors.push({ id, amount: -rounded })
    } else if (rounded > 0) {
      creditors.push({ id, amount: rounded })
    }
  }

  // Sort descending by amount for greedy algorithm
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const result: { from: string; to: string; amount: number }[] = []

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount)
    const rounded = Math.round(transfer * 100) / 100

    if (rounded > 0) {
      result.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: rounded,
      })
    }

    debtors[i].amount -= transfer
    creditors[j].amount -= transfer

    if (Math.round(debtors[i].amount * 100) === 0) i++
    if (Math.round(creditors[j].amount * 100) === 0) j++
  }

  return result
}
