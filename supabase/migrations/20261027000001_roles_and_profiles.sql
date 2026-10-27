-- =============================================================================
-- 20261027000001 — Roles and practitioner directory
--
-- Purpose
--   Introduces explicit role-based access control. Until now the admin
--   dashboard treated *any* authenticated user as an administrator, so anyone
--   able to sign up could read every booking. From this migration onwards,
--   access is granted by rows in public.user_roles, checked server-side through
--   public.has_role() inside RLS policies.
--
-- Roles
--   admin         — Imela operations staff
--   practitioner  — counsellors; see only sessions assigned to them
--   client        — optional client-portal accounts; see only their own data
--   org_admin     — organisation contacts; aggregated reporting only
--
-- Bootstrapping the first admin (run once in the Supabase SQL editor, which
-- executes as the postgres role and therefore bypasses RLS):
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com'
--   on conflict do nothing;
--
-- Idempotent and non-destructive: safe to re-run.
-- =============================================================================

create table if not exists public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('admin', 'practitioner', 'client', 'org_admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is
  'Role grants. Checked by public.has_role(); never trust roles sent from the browser.';

alter table public.user_roles enable row level security;

-- -----------------------------------------------------------------------------
-- has_role / is_admin
-- SECURITY DEFINER so policies on other tables can consult user_roles without
-- recursive RLS evaluation. search_path is pinned to '' and every object is
-- schema-qualified to prevent search-path hijacking.
-- -----------------------------------------------------------------------------
create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = p_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin');
$$;

revoke execute on function public.has_role(text) from public;
revoke execute on function public.is_admin() from public;
grant execute on function public.has_role(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Policies on user_roles --------------------------------------------------------
drop policy if exists "user_roles: read own" on public.user_roles;
create policy "user_roles: read own"
  on public.user_roles
  for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "user_roles: admins manage" on public.user_roles;
create policy "user_roles: admins manage"
  on public.user_roles
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Practitioners
-- `id` matches the front-end catalogue ids (e.g. 'karen-mwangi') so the website
-- and the database refer to the same person without a lookup table.
-- -----------------------------------------------------------------------------
create table if not exists public.practitioners (
  id           text primary key check (id ~ '^[a-z0-9-]{2,64}$'),
  user_id      uuid unique references auth.users (id) on delete set null,
  display_name text not null check (char_length(display_name) <= 120),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.practitioners is
  'Public practitioner directory. Clinical credentials live in the website catalogue only once verified.';

alter table public.practitioners enable row level security;

-- Public visitors may see active practitioners only. user_id is not sensitive
-- on its own, but we still hide it from anon by column privileges below.
drop policy if exists "practitioners: public read active" on public.practitioners;
create policy "practitioners: public read active"
  on public.practitioners
  for select
  to anon, authenticated
  using (active or (select public.is_admin()));

drop policy if exists "practitioners: admins manage" on public.practitioners;
create policy "practitioners: admins manage"
  on public.practitioners
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke select on public.practitioners from anon;
grant select (id, display_name, active) on public.practitioners to anon;

insert into public.practitioners (id, display_name)
values ('karen-mwangi', 'Karen Muthoni Mwangi')
on conflict (id) do nothing;
