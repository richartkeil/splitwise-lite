-- Scope DELETE on members to group_id
drop policy "Delete own membership" on members;
create policy "Delete member within group" on members for delete
  using (exists (select 1 from groups where groups.id = group_id));

-- Scope UPDATE and DELETE on expenses to group_id
drop policy "Update expenses" on expenses;
drop policy "Delete expenses" on expenses;
create policy "Update expense within group" on expenses for update
  using (exists (select 1 from groups where groups.id = group_id));
create policy "Delete expense within group" on expenses for delete
  using (exists (select 1 from groups where groups.id = group_id));

-- Add DELETE policy for settlements, scoped to group_id
create policy "Delete settlement within group" on settlements for delete
  using (exists (select 1 from groups where groups.id = group_id));
