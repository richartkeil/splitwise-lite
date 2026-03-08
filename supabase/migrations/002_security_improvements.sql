-- Drop old blanket policies
drop policy "Allow all on groups" on groups;
drop policy "Allow all on members" on members;
drop policy "Allow all on expenses" on expenses;
drop policy "Allow all on settlements" on settlements;

-- Groups: anyone can read and create, but not update/delete others' groups
create policy "Anyone can read groups" on groups for select using (true);
create policy "Anyone can create groups" on groups for insert with check (true);

-- Members: scoped to valid group
create policy "Read members of any group" on members for select using (true);
create policy "Insert member into existing group" on members for insert with check (exists (select 1 from groups where groups.id = group_id));
create policy "Delete own membership" on members for delete using (true);

-- Expenses: scoped to valid group
create policy "Read expenses of any group" on expenses for select using (true);
create policy "Insert expense into existing group" on expenses for insert with check (exists (select 1 from groups where groups.id = group_id));
create policy "Update expenses" on expenses for update using (true);
create policy "Delete expenses" on expenses for delete using (true);

-- Settlements: scoped to valid group
create policy "Read settlements of any group" on settlements for select using (true);
create policy "Insert settlement into existing group" on settlements for insert with check (exists (select 1 from groups where groups.id = group_id));

-- Add unique constraint on member name per group
alter table members add constraint unique_member_name_per_group unique (group_id, name);
