// Whitelist of currencies that are BOTH:
//   - supported by the Frankfurter FX API (ECB reference rates), and
//   - use exactly 2 decimal places (matches our numeric(10,2) storage and
//     the Math.round(x * 100) / 100 rounding used in balance.ts).
//
// This excludes JPY/KRW (0-decimal) and KWD/BHD (3-decimal). If we ever need
// to support those, both the schema scale and the rounding helpers have to
// change in lockstep.

export type CurrencyCode =
  | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'NZD'
  | 'SEK' | 'NOK' | 'DKK' | 'ISK'
  | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'TRY'
  | 'BRL' | 'MXN' | 'ZAR'
  | 'INR' | 'IDR' | 'MYR' | 'PHP' | 'SGD' | 'HKD' | 'THB' | 'CNY' | 'ILS'

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; name: string }[] = [
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'US-Dollar' },
  { code: 'GBP', name: 'Britisches Pfund' },
  { code: 'CHF', name: 'Schweizer Franken' },
  { code: 'CAD', name: 'Kanadischer Dollar' },
  { code: 'AUD', name: 'Australischer Dollar' },
  { code: 'NZD', name: 'Neuseeland-Dollar' },
  { code: 'SEK', name: 'Schwedische Krone' },
  { code: 'NOK', name: 'Norwegische Krone' },
  { code: 'DKK', name: 'Dänische Krone' },
  { code: 'ISK', name: 'Isländische Krone' },
  { code: 'PLN', name: 'Polnischer Zloty' },
  { code: 'CZK', name: 'Tschechische Krone' },
  { code: 'HUF', name: 'Ungarischer Forint' },
  { code: 'RON', name: 'Rumänischer Leu' },
  { code: 'BGN', name: 'Bulgarischer Lew' },
  { code: 'TRY', name: 'Türkische Lira' },
  { code: 'BRL', name: 'Brasilianischer Real' },
  { code: 'MXN', name: 'Mexikanischer Peso' },
  { code: 'ZAR', name: 'Südafrikanischer Rand' },
  { code: 'INR', name: 'Indische Rupie' },
  { code: 'IDR', name: 'Indonesische Rupiah' },
  { code: 'MYR', name: 'Malaysischer Ringgit' },
  { code: 'PHP', name: 'Philippinischer Peso' },
  { code: 'SGD', name: 'Singapur-Dollar' },
  { code: 'HKD', name: 'Hongkong-Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'CNY', name: 'Chinesischer Yuan' },
  { code: 'ILS', name: 'Israelischer Schekel' },
]

const SUPPORTED_SET = new Set<string>(SUPPORTED_CURRENCIES.map((c) => c.code))

export function isSupportedCurrency(code: string): code is CurrencyCode {
  return SUPPORTED_SET.has(code)
}
