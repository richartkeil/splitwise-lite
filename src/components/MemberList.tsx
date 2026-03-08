import type { Member } from '@/lib/types'
import { cn } from '@/lib/utils'
import { AnimalAvatar } from '@/components/AnimalAvatar'

type MemberListProps = {
  members: Member[]
  currentMemberId: string
}

export function MemberList({ members, currentMemberId }: MemberListProps) {
  return (
    <div className="flex flex-wrap gap-2">
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
    </div>
  )
}
