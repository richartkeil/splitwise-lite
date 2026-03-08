import { useEffect, useState } from 'react'
import type { Group } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/lib/utils'

export function useGroup(slug: string) {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGroup() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('groups')
        .select('*')
        .eq('slug', slug)
        .single()

      if (cancelled) return

      if (err) {
        setError(err.message)
        setGroup(null)
      } else {
        setGroup(data as unknown as Group)
      }

      setLoading(false)
    }

    fetchGroup()

    return () => {
      cancelled = true
    }
  }, [slug])

  return { group, loading, error }
}

export async function createGroup(
  name: string,
  currency: string
): Promise<Group> {
  const slug = generateSlug()

  const { data, error } = await supabase
    .from('groups')
    .insert({ name, slug, currency } as never)
    .select()
    .single()

  if (error) throw error
  return data as unknown as Group
}
