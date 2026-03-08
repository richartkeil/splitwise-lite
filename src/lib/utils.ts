import { customAlphabet } from 'nanoid'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}

const slugAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
const generateId = customAlphabet(slugAlphabet, 10)

export function generateSlug(): string {
  return generateId()
}
