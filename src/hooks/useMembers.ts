import { useEffect, useState } from 'react'
import type { Member } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function useMembers(groupId: string | undefined) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) {
      setMembers([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchMembers() {
      setLoading(true)

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId!)
        .order('created_at', { ascending: true })

      if (cancelled) return

      if (!error && data) {
        setMembers(data as unknown as Member[])
      }

      setLoading(false)
    }

    fetchMembers()

    const channel = supabase
      .channel(`members:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers((prev) => [...prev, payload.new as Member])
          } else if (payload.eventType === 'UPDATE') {
            setMembers((prev) =>
              prev.map((m) =>
                m.id === (payload.new as Member).id
                  ? (payload.new as Member)
                  : m
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMembers((prev) =>
              prev.filter((m) => m.id !== (payload.old as Partial<Member>).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [groupId])

  const addMember = async (name: string): Promise<Member> => {
    if (!groupId) throw new Error('No group ID')

    const { data, error } = await supabase
      .from('members')
      .insert({ group_id: groupId, name } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as Member
  }

  return { members, addMember, loading }
}
