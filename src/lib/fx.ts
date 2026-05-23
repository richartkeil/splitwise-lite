// Frankfurter publishes ECB reference rates. Free, no key, CORS-enabled.
// Rates are updated ~once per business day; caching per-session per-pair is
// safe (and stops React StrictMode double-renders from firing twice).
//
// The cache stores in-flight Promises (not resolved numbers) so concurrent
// callers share a single network round-trip.
//
// We use the v2 single-pair endpoint: /v2/rate/{BASE}/{QUOTE}
// → { "date": "...", "base": "USD", "quote": "EUR", "rate": 0.8614 }
// The legacy api.frankfurter.app domain 301-redirects in a way that breaks
// browser CORS, so we must hit api.frankfurter.dev directly.

const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v2/rate'

const rateCache = new Map<string, Promise<number>>()

export class ExchangeRateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExchangeRateError'
  }
}

export function fetchExchangeRate(
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return Promise.resolve(1)

  const key = `${from}:${to}`
  const cached = rateCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const url = `${FRANKFURTER_BASE}/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
    let res: Response
    try {
      res = await fetch(url)
    } catch {
      throw new ExchangeRateError(
        'Wechselkurs konnte nicht geladen werden (Netzwerkfehler).',
      )
    }

    if (!res.ok) {
      throw new ExchangeRateError(
        `Wechselkurs nicht verfügbar (${res.status}).`,
      )
    }

    const data = (await res.json()) as { rate?: number }
    const rate = data.rate
    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
      throw new ExchangeRateError(
        `Kein gültiger Wechselkurs für ${from} → ${to}.`,
      )
    }
    return rate
  })()

  // Drop the cache entry on failure so the next attempt can retry.
  promise.catch(() => rateCache.delete(key))
  rateCache.set(key, promise)
  return promise
}
