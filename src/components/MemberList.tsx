import { useState } from 'react'
import type { Member } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimalAvatar } from '@/components/AnimalAvatar'
import { Input } from '@/components/ui/Input'

type MemberListProps = {
  members: Member[]
  currentMemberId: string
  onAddMember?: (name: string) => Promise<void>
}

export function MemberList({ members, currentMemberId, onAddMember }: MemberListProps) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !onAddMember) return
    setSubmitting(true)
    try {
      await onAddMember(trimmed)
      setName('')
      setAdding(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {members.map((member, index) => {
        const isCurrentUser = member.id === currentMemberId

        return (
          <div
            key={member.id}
            className={cn(
              'flex items-center gap-2 rounded-full pl-1 pr-3.5 py-1 text-sm font-semibold transition-all',
              isCurrentUser
                ? 'bg-primary-100/80 text-primary-700 ring-1 ring-primary-300/50'
                : 'bg-white/50 text-gray-600 ring-1 ring-white/60',
            )}
          >
            <AnimalAvatar index={index} size="sm" />
            <span>{member.name}</span>
          </div>
        )
      })}
      {onAddMember && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 text-gray-400 ring-1 ring-white/60 hover:bg-white/80 hover:text-gray-600 transition-all text-lg font-light"
          aria-label="Mitglied hinzufügen"
        >
          +
        </button>
      )}
      {adding && (
        <form onSubmit={handleAdd} className="flex items-center gap-1.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            autoFocus
            className="!py-1 !px-2.5 !text-sm w-28"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100/80 text-primary-600 ring-1 ring-primary-300/50 hover:bg-primary-200/80 transition-all text-sm font-bold disabled:opacity-50"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setName('') }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 text-gray-400 ring-1 ring-white/60 hover:bg-white/80 hover:text-gray-600 transition-all text-sm"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  )
}
