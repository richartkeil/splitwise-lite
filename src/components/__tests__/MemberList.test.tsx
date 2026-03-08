import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows add button when onAddMember is provided', () => {
    render(<MemberList members={members} currentMemberId="member-1" onAddMember={vi.fn()} />)

    expect(screen.getByRole('button', { name: /mitglied hinzufügen/i })).toBeInTheDocument()
  })

  it('does not show add button when onAddMember is not provided', () => {
    render(<MemberList members={members} currentMemberId="member-1" />)

    expect(screen.queryByRole('button', { name: /mitglied hinzufügen/i })).not.toBeInTheDocument()
  })

  it('shows inline form when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<MemberList members={members} currentMemberId="member-1" onAddMember={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /mitglied hinzufügen/i }))

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
  })

  it('calls onAddMember with the entered name', async () => {
    const user = userEvent.setup()
    const onAddMember = vi.fn().mockResolvedValue(undefined)
    render(<MemberList members={members} currentMemberId="member-1" onAddMember={onAddMember} />)

    await user.click(screen.getByRole('button', { name: /mitglied hinzufügen/i }))
    await user.type(screen.getByPlaceholderText('Name'), 'Dana')
    await user.click(screen.getByText('✓'))

    expect(onAddMember).toHaveBeenCalledWith('Dana')
  })
})
