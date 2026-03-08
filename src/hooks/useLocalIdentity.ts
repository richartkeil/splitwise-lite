import { useState } from 'react'

interface LocalIdentity {
  memberId: string
  memberName: string
}

function getStorageKey(groupSlug: string): string {
  return `splitwise-member-${groupSlug}`
}

function readIdentity(groupSlug: string): LocalIdentity | null {
  try {
    const raw = localStorage.getItem(getStorageKey(groupSlug))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.memberId && parsed.memberName) return parsed
    return null
  } catch {
    return null
  }
}

export function useLocalIdentity(groupSlug: string) {
  const [identity, setIdentityState] = useState<LocalIdentity | null>(() =>
    readIdentity(groupSlug)
  )

  const setIdentity = (memberId: string, memberName: string) => {
    const value: LocalIdentity = { memberId, memberName }
    localStorage.setItem(getStorageKey(groupSlug), JSON.stringify(value))
    setIdentityState(value)
  }

  const clearIdentity = () => {
    localStorage.removeItem(getStorageKey(groupSlug))
    setIdentityState(null)
  }

  return {
    memberId: identity?.memberId ?? null,
    memberName: identity?.memberName ?? null,
    setIdentity,
    clearIdentity,
  }
}
