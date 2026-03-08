import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberList } from '@/components/MemberList'
import type { Member } from '@/lib/types'

const members: Member[] = [
  { id: 'member-1', group_id: 'group-1', name: 'Alice', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-2', group_id: 'group-1', name: 'Bob', created_at: '2026-01-01T00:00:00Z' },
  { id: 'member-3', group_id: 'group-1', name: 'Charlie', created_at: '2026-01-01T00:00:00Z' },
]

describe('MemberList', () => {
  it('shows all member names', () => {
    render(<MemberList members={members} currentMemberId="member-1" />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('highlights current member with distinct styling', () => {
    render(<MemberList members={members} currentMemberId="member-2" />)

    const bobText = screen.getByText('Bob')
    const bobContainer = bobText.closest('div[class*="rounded-full"]')

    expect(bobContainer).toHaveClass('bg-primary-100/80')
    expect(bobContainer).toHaveClass('text-primary-700')

    const aliceText = screen.getByText('Alice')
    const aliceContainer = aliceText.closest('div[class*="rounded-full"]')

    expect(aliceContainer).not.toHaveClass('bg-primary-100/80')
    expect(aliceContainer).toHaveClass('bg-white/50')
  })
})
