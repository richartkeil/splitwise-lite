import { useEffect, useState } from 'react'
import type { Settlement } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function useSettlements(groupId: string | undefined) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) {
      setSettlements([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchSettlements() {
      setLoading(true)

      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('group_id', groupId!)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (!error && data) {
        setSettlements(data as unknown as Settlement[])
      }

      setLoading(false)
    }

    fetchSettlements()

    const channel = supabase
      .channel(`settlements:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSettlements((prev) => {
              const newSettlement = payload.new as Settlement
              if (prev.some((s) => s.id === newSettlement.id)) return prev
              return [newSettlement, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setSettlements((prev) =>
              prev.map((s) =>
                s.id === (payload.new as Settlement).id
                  ? (payload.new as Settlement)
                  : s
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setSettlements((prev) =>
              prev.filter(
                (s) => s.id !== (payload.old as Partial<Settlement>).id
              )
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

  const addSettlement = async (
    fromMember: string,
    toMember: string,
    amount: number
  ): Promise<Settlement> => {
    if (!groupId) throw new Error('No group ID')

    const { data, error } = await supabase
      .from('settlements')
      .insert({
        group_id: groupId,
        from_member: fromMember,
        to_member: toMember,
        amount,
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as Settlement
  }

  return { settlements, addSettlement, loading }
}
