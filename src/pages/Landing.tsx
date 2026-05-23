import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '@/hooks/useGroup'
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/currencies'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Landing() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('EUR')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = groupName.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      const group = await createGroup(trimmed, currency)
      navigate(`/g/${group.slug}`)
    } catch (err) {
      console.error('Failed to create group:', err)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Splitwise Lite
        </h1>
        <p className="mt-3 text-lg text-gray-500 font-medium">
          Teile Ausgaben mit Freunden. Kein Account nötig.
        </p>

        <div className="glass-strong rounded-3xl shadow-fluent-lg p-8 mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="group-name"
              placeholder="Gruppenname, z.B. Sommerurlaub"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <div>
              <label htmlFor="group-currency" className="block text-sm font-semibold text-gray-600 mb-1.5 text-left">
                Währung
              </label>
              <select
                id="group-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-xl bg-white/60 border border-white/50 px-4 py-2.5 text-sm shadow-sm backdrop-blur-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 focus:outline-none transition-all"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-400 text-left">
                Kann später nicht mehr geändert werden.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!groupName.trim() || submitting}
            >
              {submitting ? 'Wird erstellt...' : 'Gruppe erstellen'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
