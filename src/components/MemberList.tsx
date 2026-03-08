import type { Member } from '@/lib/types'
import { cn } from '@/lib/utils'

type MemberListProps = {
  members: Member[]
  currentMemberId: string
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
]

export function MemberList({ members, currentMemberId }: MemberListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member, index) => {
        const isCurrentUser = member.id === currentMemberId
        const colorClass = avatarColors[index % avatarColors.length]

        return (
          <div
            key={member.id}
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors',
              isCurrentUser
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-200 text-gray-700',
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white shrink-0',
                colorClass,
              )}
            >
              {member.name.charAt(0).toUpperCase()}
            </span>
            <span>{member.name}</span>
          </div>
        )
      })}
    </div>
  )
}
