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
    <Dialog open={open} onClose={() => {}} title={`${groupName} beitreten`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-gray-500 text-center">
          Gib deinen Namen ein, um <span className="font-semibold text-gray-700">{groupName}</span> beizutreten
        </p>
        <Input
          id="join-name"
          label="Dein Name"
          placeholder="z.B. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <Button type="submit" className="w-full" disabled={!name.trim()}>
          Beitreten
        </Button>
      </form>
    </Dialog>
  )
}
