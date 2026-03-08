import { useState } from 'react'
import type { Expense, Member } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type ExpenseFormData = {
  description: string
  amount: number
  paid_by: string
  split_among: string[]
}

type ExpenseFormProps = {
  members: Member[]
  currentMemberId: string
  onSubmit: (data: ExpenseFormData) => void
  onCancel: () => void
  initialData?: Expense
}

export function ExpenseForm({
  members,
  currentMemberId,
  onSubmit,
  onCancel,
  initialData,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '')
  const [paidBy, setPaidBy] = useState(initialData?.paid_by ?? currentMemberId)
  const [splitAmong, setSplitAmong] = useState<string[]>(
    initialData?.split_among ?? members.map((m) => m.id),
  )

  const isEditing = !!initialData

  function toggleMember(memberId: string) {
    setSplitAmong((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedDescription = description.trim()
    const parsedAmount = parseFloat(amount)

    if (!trimmedDescription || parsedAmount <= 0 || splitAmong.length === 0) return

    onSubmit({
      description: trimmedDescription,
      amount: parsedAmount,
      paid_by: paidBy,
      split_among: splitAmong,
    })
  }

  const isValid =
    description.trim().length > 0 &&
    parseFloat(amount) > 0 &&
    splitAmong.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="expense-description"
        label="Description"
        placeholder="e.g. Dinner, Groceries"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        autoFocus
      />

      <Input
        id="expense-amount"
        label="Amount"
        type="number"
        placeholder="0.00"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div>
        <label htmlFor="expense-paid-by" className="block text-sm font-medium text-gray-700 mb-1">
          Paid by
        </label>
        <select
          id="expense-paid-by"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white"
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
              {member.id === currentMemberId ? ' (you)' : ''}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Split among
        </legend>
        <div className="space-y-2">
          {members.map((member) => (
            <label
              key={member.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors',
                splitAmong.includes(member.id)
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
            >
              <input
                type="checkbox"
                checked={splitAmong.includes(member.id)}
                onChange={() => toggleMember(member.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">
                {member.name}
                {member.id === currentMemberId ? ' (you)' : ''}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid} className="flex-1">
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}
