import { useEffect, useState } from 'react'
import type { Expense, Member } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency } from '@/lib/utils'
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/currencies'
import { fetchExchangeRate } from '@/lib/fx'

type ExpenseFormData = {
  description: string
  amount: number
  paid_by: string
  split_among: string[]
  original_amount: number | null
  original_currency: string | null
  exchange_rate: number | null
}

type ExpenseFormProps = {
  members: Member[]
  currentMemberId: string
  groupCurrency: string
  onSubmit: (data: ExpenseFormData) => void
  onCancel: () => void
  initialData?: Expense
  submitting?: boolean
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function ExpenseForm({
  members,
  currentMemberId,
  groupCurrency,
  onSubmit,
  onCancel,
  initialData,
  submitting,
}: ExpenseFormProps) {
  // Editing an expense that was entered in a non-base currency: pre-fill the
  // form with the original amount/currency, not the converted base amount.
  const initialOriginalCurrency = initialData?.original_currency ?? null
  const initialExchangeRate = initialData?.exchange_rate ?? null
  const initialCurrency = (initialOriginalCurrency ?? groupCurrency) as CurrencyCode
  const initialAmount = initialData
    ? String(initialData.original_amount ?? initialData.amount)
    : ''

  const [description, setDescription] = useState(initialData?.description ?? '')
  const [amount, setAmount] = useState(initialAmount)
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency)
  const [paidBy, setPaidBy] = useState(initialData?.paid_by ?? currentMemberId)
  const [splitAmong, setSplitAmong] = useState<string[]>(
    initialData?.split_among ?? members.map((m) => m.id),
  )

  // Exchange rate state. null = not yet known.
  const [rate, setRate] = useState<number | null>(
    initialCurrency === groupCurrency ? 1 : initialExchangeRate,
  )
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)

  const isEditing = !!initialData
  const isForeign = currency !== groupCurrency

  // Resolve the rate whenever the selected currency changes. For the edit case
  // we keep the rate that was locked in at expense creation time — only fetch
  // fresh when the user actually picks a different currency.
  useEffect(() => {
    setRateError(null)

    if (currency === groupCurrency) {
      setRate(1)
      setRateLoading(false)
      return
    }

    if (
      initialOriginalCurrency === currency &&
      typeof initialExchangeRate === 'number'
    ) {
      setRate(initialExchangeRate)
      setRateLoading(false)
      return
    }

    let cancelled = false
    setRateLoading(true)
    setRate(null)
    fetchExchangeRate(currency, groupCurrency)
      .then((r) => {
        if (!cancelled) setRate(r)
      })
      .catch((e) => {
        if (cancelled) return
        setRate(null)
        setRateError(e instanceof Error ? e.message : 'Wechselkurs nicht verfügbar.')
      })
      .finally(() => {
        if (!cancelled) setRateLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currency, groupCurrency, initialOriginalCurrency, initialExchangeRate])

  function toggleMember(memberId: string) {
    setSplitAmong((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    )
  }

  const parsedAmount = parseFloat(amount)
  const hasValidAmount = parsedAmount > 0
  const convertedAmount =
    isForeign && rate != null && hasValidAmount
      ? round2(parsedAmount * rate)
      : null
  // A non-zero original that rounds to 0 in the base currency would violate
  // the amount > 0 DB check — surface it before submit.
  const wouldRoundToZero =
    isForeign && hasValidAmount && convertedAmount !== null && convertedAmount < 0.01

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedDescription = description.trim()
    if (!trimmedDescription || !hasValidAmount || splitAmong.length === 0) return
    if (rate == null || wouldRoundToZero) return

    if (currency === groupCurrency) {
      onSubmit({
        description: trimmedDescription,
        amount: round2(parsedAmount),
        paid_by: paidBy,
        split_among: splitAmong,
        original_amount: null,
        original_currency: null,
        exchange_rate: null,
      })
      return
    }

    onSubmit({
      description: trimmedDescription,
      amount: round2(parsedAmount * rate),
      paid_by: paidBy,
      split_among: splitAmong,
      original_amount: round2(parsedAmount),
      original_currency: currency,
      exchange_rate: rate,
    })
  }

  const isValid =
    description.trim().length > 0 &&
    hasValidAmount &&
    splitAmong.length > 0 &&
    rate != null &&
    !wouldRoundToZero

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="expense-description"
        label="Beschreibung"
        placeholder="z.B. Abendessen, Einkauf"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        autoFocus
      />

      <div>
        <label htmlFor="expense-amount" className="block text-sm font-semibold text-gray-600 mb-1.5">
          Betrag
        </label>
        <div className="flex gap-2">
          <input
            id="expense-amount"
            type="number"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="flex-1 min-w-0 rounded-xl bg-white/60 border border-white/50 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none focus:bg-white/80 transition-all placeholder:text-gray-400"
          />
          <select
            aria-label="Währung"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="shrink-0 w-28 rounded-xl bg-white/60 border border-white/50 px-3 py-2.5 text-sm shadow-sm backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none transition-all"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        {isForeign && (
          <div className="mt-1.5 text-xs min-h-[1rem]">
            {rateError ? (
              <span className="text-red-600">{rateError}</span>
            ) : rateLoading ? (
              <span className="text-gray-400">Wechselkurs wird geladen…</span>
            ) : wouldRoundToZero ? (
              <span className="text-red-600">
                Betrag zu klein — ergibt 0 {groupCurrency}.
              </span>
            ) : convertedAmount != null ? (
              <span className="text-gray-500">
                ≈ {formatCurrency(convertedAmount, groupCurrency)} (Kurs{' '}
                {rate?.toFixed(4)})
              </span>
            ) : (
              <span className="text-gray-400">
                Wird zum Tageskurs in {groupCurrency} umgerechnet.
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="expense-paid-by" className="block text-sm font-semibold text-gray-600 mb-1.5">
          Bezahlt von
        </label>
        <select
          id="expense-paid-by"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full rounded-xl bg-white/60 border border-white/50 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none transition-all"
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
              {member.id === currentMemberId ? ' (du)' : ''}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-600 mb-2">
          Aufteilen auf
        </legend>
        <div className="space-y-2">
          {members.map((member) => (
            <label
              key={member.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all',
                splitAmong.includes(member.id)
                  ? 'border-primary-300/60 bg-primary-50/50 shadow-sm'
                  : 'border-white/40 bg-white/30 hover:bg-white/50',
              )}
            >
              <input
                type="checkbox"
                checked={splitAmong.includes(member.id)}
                onChange={() => toggleMember(member.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {member.name}
                {member.id === currentMemberId ? ' (du)' : ''}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" disabled={!isValid || submitting} className="flex-1">
          {submitting ? 'Wird gespeichert...' : isEditing ? 'Ausgabe aktualisieren' : 'Ausgabe hinzufügen'}
        </Button>
      </div>
    </form>
  )
}
