import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '@/hooks/useGroup'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Landing() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = groupName.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      const group = await createGroup(trimmed, 'EUR')
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
          Split expenses with friends. No account needed.
        </p>

        <div className="glass-strong rounded-3xl shadow-fluent-lg p-8 mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="group-name"
              placeholder="Group name, e.g. Summer Trip"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!groupName.trim() || submitting}
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
