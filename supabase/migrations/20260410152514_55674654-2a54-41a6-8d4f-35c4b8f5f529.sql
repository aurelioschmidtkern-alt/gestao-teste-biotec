create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid null references profiles(id) on delete set null,
  workspace_id uuid null,
  action text not null,
  entity text not null,
  entity_id uuid not null,
  entity_name text null,
  description text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert to authenticated
  with check (true);

create policy "Admins and coordinators can view audit logs"
  on public.audit_logs for select to authenticated
  using (is_admin(auth.uid()) or is_coordinator(auth.uid()));