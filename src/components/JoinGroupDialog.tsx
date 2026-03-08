import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type JoinGroupDialogProps = {
  open: boolean
  groupName: string
  onJoin: (name: string) => void
}

export function JoinGroupDialog({ open, groupName, onJoin }: JoinGroupDialogProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onJoin(trimmed)
  }

  return (
    <Dialog open={open} onClose={() => {}} title={`Join ${groupName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter your name to join <span className="font-medium">{groupName}</span>
        </p>
        <Input
          id="join-name"
          label="Your name"
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <Button type="submit" className="w-full" disabled={!name.trim()}>
          Join
        </Button>
      </form>
    </Dialog>
  )
}
