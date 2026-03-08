-- Groups
create table groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  currency text not null default 'EUR',
  created_at timestamptz not null default now()
);

-- Members
create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  paid_by uuid not null references members(id) on delete cascade,
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  split_among uuid[] not null,
  created_at timestamptz not null default now()
);

-- Settlements
create table settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  from_member uuid not null references members(id) on delete cascade,
  to_member uuid not null references members(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_members_group on members(group_id);
create index idx_expenses_group on expenses(group_id);
create index idx_settlements_group on settlements(group_id);

-- Enable RLS
alter table groups enable row level security;
alter table members enable row level security;
alter table expenses enable row level security;
alter table settlements enable row level security;

-- Permissive policies (security is through the slug/link)
create policy "Allow all on groups" on groups for all using (true) with check (true);
create policy "Allow all on members" on members for all using (true) with check (true);
create policy "Allow all on expenses" on expenses for all using (true) with check (true);
create policy "Allow all on settlements" on settlements for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table settlements;
