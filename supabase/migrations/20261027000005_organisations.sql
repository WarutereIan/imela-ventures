-- =============================================================================
-- 20261027000005 — Corporate wellness: organisations, programmes, reporting
--
-- Privacy model
--   - Organisation admins see their organisation, its programmes and event
--     *counts* — never individual sessions, names, services or notes.
--   - There is deliberately NO policy granting org admins SELECT on
--     public.sessions. Utilisation is available only through
--     org_utilisation_summary(), which aggregates by month and suppresses any
--     month with fewer than 5 sessions (k-anonymity threshold) so that small
--     teams cannot infer who attended counselling.
--
-- Idempotent and non-destructive.
-- =============================================================================

create table if not exists public.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists public.organisation_members (
  org_id     uuid not null references public.organisations (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('org_admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists organisation_members_user_idx on public.organisation_members (user_id);

create table if not exists public.corporate_programmes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organisations (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 160),
  description text check (description is null or char_length(description) <= 4000),
  status      text not null default 'proposed' check (status in ('proposed', 'active', 'completed', 'paused')),
  starts_on   date,
  ends_on     date,
  created_at  timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create index if not exists corporate_programmes_org_idx on public.corporate_programmes (org_id);

create table if not exists public.programme_events (
  id             uuid primary key default gen_random_uuid(),
  programme_id   uuid not null references public.corporate_programmes (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 160),
  kind           text not null check (kind in ('workshop', 'training', 'consultation', 'webinar')),
  scheduled_at   timestamptz,
  capacity       int check (capacity is null or capacity >= 0),
  -- Counts only. Attendee identities are never stored in this table.
  attendee_count int check (attendee_count is null or attendee_count >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists programme_events_programme_idx on public.programme_events (programme_id);

-- Employer-sponsored sessions (nullable; personal bookings leave it empty).
alter table public.sessions add column if not exists org_id uuid references public.organisations (id) on delete set null;
create index if not exists sessions_org_id_idx on public.sessions (org_id) where org_id is not null;

-- ---------------------------------------------------------------------------
-- Membership helper
-- ---------------------------------------------------------------------------
create or replace function public.is_org_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organisation_members m
    where m.org_id = p_org
      and m.user_id = (select auth.uid())
      and m.role = 'org_admin'
  );
$$;

revoke execute on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.corporate_programmes enable row level security;
alter table public.programme_events enable row level security;

drop policy if exists "organisations: org admins read" on public.organisations;
create policy "organisations: org admins read"
  on public.organisations for select to authenticated
  using ((select public.is_org_admin(id)) or (select public.is_admin()));

drop policy if exists "organisations: admins manage" on public.organisations;
create policy "organisations: admins manage"
  on public.organisations for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "organisation_members: read own membership" on public.organisation_members;
create policy "organisation_members: read own membership"
  on public.organisation_members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "organisation_members: admins manage" on public.organisation_members;
create policy "organisation_members: admins manage"
  on public.organisation_members for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "corporate_programmes: org admins read" on public.corporate_programmes;
create policy "corporate_programmes: org admins read"
  on public.corporate_programmes for select to authenticated
  using ((select public.is_org_admin(org_id)) or (select public.is_admin()));

drop policy if exists "corporate_programmes: admins manage" on public.corporate_programmes;
create policy "corporate_programmes: admins manage"
  on public.corporate_programmes for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "programme_events: org admins read" on public.programme_events;
create policy "programme_events: org admins read"
  on public.programme_events for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1
      from public.corporate_programmes cp
      where cp.id = programme_events.programme_id
        and public.is_org_admin(cp.org_id)
    )
  );

drop policy if exists "programme_events: admins manage" on public.programme_events;
create policy "programme_events: admins manage"
  on public.programme_events for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Aggregated, suppressed utilisation reporting
-- ---------------------------------------------------------------------------
create or replace function public.org_utilisation_summary(p_org uuid, p_from date, p_to date)
returns table (month date, sessions_count int, suppressed boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  -- Minimum group size before a count is shown. Raising it is always safe;
  -- lowering it risks re-identifying individual employees.
  k_threshold constant int := 5;
begin
  if not (public.is_org_admin(p_org) or public.is_admin()) then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 731 then
    raise exception 'invalid date range' using errcode = '22023';
  end if;

  return query
  with months as (
    select generate_series(date_trunc('month', p_from), date_trunc('month', p_to), interval '1 month')::date as m
  ),
  counts as (
    select date_trunc('month', s."date")::date as m, count(*)::int as c
    from public.sessions s
    where s.org_id = p_org
      and s.status in ('confirmed', 'completed')
      and s."date" between p_from and p_to
    group by 1
  )
  select months.m,
         case when coalesce(counts.c, 0) = 0 then 0
              when counts.c < k_threshold then null
              else counts.c end,
         coalesce(counts.c, 0) between 1 and k_threshold - 1
  from months
  left join counts on counts.m = months.m
  order by months.m;
end;
$$;

revoke execute on function public.org_utilisation_summary(uuid, date, date) from public;
grant execute on function public.org_utilisation_summary(uuid, date, date) to authenticated;
