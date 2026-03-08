# Splitwise Lite

Split expenses with friends. No account needed — just share a link.

## Stack

React + TypeScript + Vite + Tailwind CSS + Supabase (Postgres, Realtime)

## Setup

```bash
bun install
cp .env.example .env       # fill in your Supabase credentials
```

## Local dev

```bash
supabase start             # local Postgres, Realtime, etc. via Docker
supabase db reset           # apply all migrations locally
bun dev                     # runs at localhost:5173
```

Create `.env.local` with the local credentials from `supabase start` output:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>
```

## Tests

```bash
bun test
```

## Migrations

```bash
supabase migration new <name>   # create new migration
supabase db push                # apply to remote
supabase db reset               # replay all locally
```

## Deploy

```bash
bun run deploy              # runs tests, pushes migrations, deploys to Vercel
```

Requires `vercel` CLI logged in and `supabase` CLI linked to your project. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables.
