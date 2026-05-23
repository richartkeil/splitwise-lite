-- Per-expense currency support.
-- `amount` keeps storing the value in the group's base currency (so existing
-- balance math stays untouched). When an expense was entered in a different
-- currency we additionally persist the original input plus the FX rate used
-- to convert it.
--
-- All columns are nullable: null = "expense was entered in the group's base
-- currency, no conversion happened". This avoids backfilling existing rows.

alter table expenses
  add column original_amount numeric(10,2) check (original_amount is null or original_amount > 0),
  add column original_currency text,
  add column exchange_rate numeric(20,10) check (exchange_rate is null or exchange_rate > 0);
