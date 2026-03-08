import { describe, it, expect } from 'vitest'
import { computeBalances, simplifyDebts } from '@/lib/balance'
import type { Expense, Settlement } from '@/lib/types'

function makeExpense(overrides: Partial<Expense> & Pick<Expense, 'paid_by' | 'amount' | 'split_among'>): Expense {
  return {
    id: 'expense-1',
    group_id: 'group-1',
    description: 'Test expense',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeSettlement(overrides: Partial<Settlement> & Pick<Settlement, 'from_member' | 'to_member' | 'amount'>): Settlement {
  return {
    id: 'settlement-1',
    group_id: 'group-1',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('computeBalances', () => {
  it('returns empty balances when there are no expenses', () => {
    const balances = computeBalances([], [])
    expect(balances).toEqual({})
  })

  it('computes correct balances for a single expense split among 3 people', () => {
    const expense = makeExpense({
      paid_by: 'member-1',
      amount: 30,
      split_among: ['member-1', 'member-2', 'member-3'],
    })

    const balances = computeBalances([expense], [])

    // member-1 paid 30, owes 10 share → net +20
    // member-2 owes 10 share → net -10
    // member-3 owes 10 share → net -10
    expect(balances['member-1']).toBeCloseTo(20)
    expect(balances['member-2']).toBeCloseTo(-10)
    expect(balances['member-3']).toBeCloseTo(-10)
  })

  it('computes correct balances with multiple payers', () => {
    const expenses: Expense[] = [
      makeExpense({
        id: 'expense-1',
        paid_by: 'member-1',
        amount: 30,
        split_among: ['member-1', 'member-2', 'member-3'],
      }),
      makeExpense({
        id: 'expense-2',
        paid_by: 'member-2',
        amount: 15,
        split_among: ['member-1', 'member-2', 'member-3'],
      }),
    ]

    const balances = computeBalances(expenses, [])

    // member-1: +30 - 10 - 5 = +15
    // member-2: -10 + 15 - 5 = 0
    // member-3: -10 - 5 = -15
    expect(balances['member-1']).toBeCloseTo(15)
    expect(balances['member-2']).toBeCloseTo(0)
    expect(balances['member-3']).toBeCloseTo(-15)
  })

  it('accounts for settlements reducing debts', () => {
    const expense = makeExpense({
      paid_by: 'member-1',
      amount: 30,
      split_among: ['member-1', 'member-2', 'member-3'],
    })

    const settlement = makeSettlement({
      from_member: 'member-2',
      to_member: 'member-1',
      amount: 10,
    })

    const balances = computeBalances([expense], [settlement])

    // member-1: +30 - 10 (share) - 10 (received settlement) = +10
    // member-2: -10 + 10 (paid settlement) = 0
    // member-3: -10
    expect(balances['member-1']).toBeCloseTo(10)
    expect(balances['member-2']).toBeCloseTo(0)
    expect(balances['member-3']).toBeCloseTo(-10)
  })
})

describe('simplifyDebts', () => {
  it('returns no debts when all balances are zero', () => {
    const debts = simplifyDebts({ 'member-1': 0, 'member-2': 0 })
    expect(debts).toEqual([])
  })

  it('simplifies debts correctly for a simple case', () => {
    const balances = {
      'member-1': 20,
      'member-2': -10,
      'member-3': -10,
    }

    const debts = simplifyDebts(balances)

    expect(debts).toHaveLength(2)

    const totalToMember1 = debts
      .filter((d) => d.to === 'member-1')
      .reduce((sum, d) => sum + d.amount, 0)
    expect(totalToMember1).toBeCloseTo(20)

    const member2Debt = debts.find((d) => d.from === 'member-2')
    expect(member2Debt).toBeDefined()
    expect(member2Debt!.amount).toBeCloseTo(10)

    const member3Debt = debts.find((d) => d.from === 'member-3')
    expect(member3Debt).toBeDefined()
    expect(member3Debt!.amount).toBeCloseTo(10)
  })

  it('rounds amounts to 2 decimal places', () => {
    // 10 / 3 = 3.3333... per person
    // payer net: 10 - 3.3333 = 6.6667
    // others: -3.3333 each
    const balances = {
      'member-1': 6.666666667,
      'member-2': -3.333333333,
      'member-3': -3.333333334,
    }

    const debts = simplifyDebts(balances)

    for (const debt of debts) {
      const decimalPlaces = debt.amount.toString().split('.')[1]?.length ?? 0
      expect(decimalPlaces).toBeLessThanOrEqual(2)
    }
  })

  it('handles complex multi-person debts', () => {
    const balances = {
      'member-1': 50,
      'member-2': -20,
      'member-3': -30,
    }

    const debts = simplifyDebts(balances)

    // Total owed to member-1 should be 50
    const totalPaid = debts.reduce((sum, d) => sum + d.amount, 0)
    expect(totalPaid).toBeCloseTo(50)
  })
})
