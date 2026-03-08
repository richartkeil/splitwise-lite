import { useEffect, useState } from 'react'
import type { Expense } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function useExpenses(groupId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!groupId) {
      setExpenses([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchExpenses() {
      setLoading(true)

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId!)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (!error && data) {
        setExpenses(data as unknown as Expense[])
      }

      setLoading(false)
    }

    fetchExpenses()

    const channel = supabase
      .channel(`expenses:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExpenses((prev) => {
              const newExpense = payload.new as Expense
              if (prev.some((e) => e.id === newExpense.id)) return prev
              return [newExpense, ...prev].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
            })
          } else if (payload.eventType === 'UPDATE') {
            setExpenses((prev) =>
              prev.map((e) =>
                e.id === (payload.new as Expense).id
                  ? (payload.new as Expense)
                  : e
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setExpenses((prev) =>
              prev.filter(
                (e) => e.id !== (payload.old as Partial<Expense>).id
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

  const addExpense = async (data: {
    paid_by: string
    description: string
    amount: number
    split_among: string[]
  }): Promise<Expense> => {
    if (!groupId) throw new Error('No group ID')

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({ ...data, group_id: groupId } as never)
      .select()
      .single()

    if (error) throw error
    return expense as unknown as Expense
  }

  const updateExpense = async (
    id: string,
    data: {
      paid_by?: string
      description?: string
      amount?: number
      split_among?: string[]
    }
  ): Promise<Expense> => {
    const { data: expense, error } = await supabase
      .from('expenses')
      .update(data as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return expense as unknown as Expense
  }

  const deleteExpense = async (id: string): Promise<void> => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  return { expenses, addExpense, updateExpense, deleteExpense, loading }
}
