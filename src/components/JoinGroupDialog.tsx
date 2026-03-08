import { useState } from 'react'
import type { Member } from '@/lib/types'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AnimalAvatar, getMemberIndex } from '@/components/AnimalAvatar'

type JoinGroupDialogProps = {
  open: boolean
  groupName: string
  members: Member[]
  onJoin: (name: string) => void
  onClaim: (memberId: string) => void
}

export function JoinGroupDialog({ open, groupName, members, onJoin, onClaim }: JoinGroupDialogProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onJoin(trimmed)
  }

  return (
    <Dialog open={open} onClose={() => {}} title={`${groupName} beitreten`}>
      <div className="space-y-5">
        <p className="text-sm text-gray-500 text-center">
          Wer bist du in <span className="font-semibold text-gray-700">{groupName}</span>?
        </p>

        {members.length > 0 && (
          <div className="space-y-2">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => onClaim(member.id)}
                className="w-full flex items-center gap-3 rounded-xl p-3 text-left bg-white/50 ring-1 ring-white/60 hover:bg-white/80 hover:ring-primary-200/60 transition-all"
              >
                <AnimalAvatar index={getMemberIndex(members, member.id)} size="sm" />
                <span className="text-sm font-semibold text-gray-700">{member.name}</span>
              </button>
            ))}
          </div>
        )}

        {members.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200/60" />
            <span className="text-xs font-medium text-gray-400">oder neu</span>
            <div className="flex-1 h-px bg-gray-200/60" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="join-name"
            label="Dein Name"
            placeholder="z.B. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={members.length === 0}
            required
          />
          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Beitreten
          </Button>
        </form>
      </div>
    </Dialog>
  )
}
