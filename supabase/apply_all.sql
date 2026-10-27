-- =====================================================================
-- Imela Ventures — all migrations combined, in order (0001 → 0007).
-- GENERATED from supabase/migrations/*.sql. Edit those files, not this one.
-- Paste into Supabase Dashboard → SQL Editor and click Run.
-- Safe to re-run: every statement is idempotent and nothing is deleted.
-- =====================================================================


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000001_roles_and_profiles.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000002_harden_sessions.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- =============================================================================
-- 20261027000002 — Harden bookings (public.sessions)
--
-- Purpose
--   1. Replace the over-broad legacy policies. Previously *any* authenticated
--      user could read and update every booking (names, emails, phone numbers,
--      free-text messages), and a documented optional policy allowed anonymous
--      reads too. Booking data is sensitive health-adjacent personal data under
--      the Kenya Data Protection Act; access is now role-based.
--   2. Make booking concurrency-safe. A partial UNIQUE index guarantees that
--      two active bookings can never hold the same slot, even when two people
--      submit at the same instant. The website's plain INSERT receives
--      Postgres error 23505 (unique_violation) and asks the person to choose
--      another time.
--   3. Expose availability without exposing people: get_booked_slots() and
--      get_closed_dates() return only dates/times, never names or contacts.
--   4. Record every status change in session_status_history (audit trail).
--
-- Website contract after this migration
--   - INSERT without `.select()` (anon has no SELECT on sessions). The client
--     generates the row id itself with crypto.randomUUID().
--   - Read taken slots via rpc('get_booked_slots', { from_date, to_date }).
--   - Read closed dates via rpc('get_closed_dates', { from_date, to_date }).
--   - Read bookable times via select on public.availability_slots.
--
-- Idempotent and non-destructive: adds nullable columns only; no data removed.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New nullable columns (existing rows unaffected)
-- ---------------------------------------------------------------------------
alter table public.sessions add column if not exists client_user_id   uuid references auth.users (id) on delete set null;
alter table public.sessions add column if not exists practitioner_id  text references public.practitioners (id) on delete set null;
alter table public.sessions add column if not exists starts_at        timestamptz;
alter table public.sessions add column if not exists duration_minutes int check (duration_minutes is null or duration_minutes between 5 and 480);
alter table public.sessions add column if not exists source           text default 'website';
alter table public.sessions add column if not exists cancelled_at     timestamptz;
alter table public.sessions add column if not exists created_at       timestamptz default now();
alter table public.sessions add column if not exists updated_at       timestamptz default now();

-- Indexes supporting the policies and dashboard queries (RLS columns must be indexed).
create index if not exists sessions_client_user_id_idx  on public.sessions (client_user_id) where client_user_id is not null;
create index if not exists sessions_practitioner_id_idx on public.sessions (practitioner_id) where practitioner_id is not null;
create index if not exists sessions_date_idx            on public.sessions ("date");
create index if not exists sessions_status_idx          on public.sessions (status);

-- ---------------------------------------------------------------------------
-- Double-booking prevention
-- If legacy data already contains two active bookings for one slot, creating
-- the unique index would fail. In that case we skip it and raise a WARNING so
-- an operator can resolve the duplicates (listed by the query in the message)
-- and re-run this migration. Nothing is deleted automatically.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from public.sessions
    where status in ('pending', 'confirmed')
    group by "date", "time", coalesce(practitioner_id, 'default')
    having count(*) > 1
  ) then
    raise warning
      'sessions_active_slot_unique NOT created: duplicate active bookings exist. Find them with: select "date","time",count(*) from public.sessions where status in (''pending'',''confirmed'') group by 1,2 having count(*)>1; then re-run this migration.';
  else
    create unique index if not exists sessions_active_slot_unique
      on public.sessions ("date", "time", (coalesce(practitioner_id, 'default')))
      where status in ('pending', 'confirmed');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.sessions enable row level security;

-- Remove the legacy, over-broad policies (names from docs/booking-flow-setup.md).
-- NOTE for operators: other permissive policies created by hand in the
-- dashboard would still apply (permissive policies are OR-ed). Check with:
--   select policyname, roles, cmd, qual from pg_policies where tablename = 'sessions';
drop policy if exists "Anyone can create bookings" on public.sessions;
drop policy if exists "Authenticated users can read all bookings" on public.sessions;
drop policy if exists "Authenticated users can update bookings" on public.sessions;
drop policy if exists "Users can read their own bookings" on public.sessions;

-- Public booking requests: only new, pending rows with sane field sizes. A
-- signed-in client may link the booking to themselves but never to anyone else.
drop policy if exists "sessions: public create pending" on public.sessions;
create policy "sessions: public create pending"
  on public.sessions
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and (client_user_id is null or client_user_id = (select auth.uid()))
    and cancelled_at is null
    and char_length(customer_name) between 1 and 120
    and char_length(email) between 3 and 254
    and email like '%_@_%'
    and char_length(phone) between 3 and 32
    and (message is null or char_length(message) <= 2000)
    and char_length(service) <= 80
    and (source is null or char_length(source) <= 40)
    and "date" >= current_date
  );

drop policy if exists "sessions: admins read" on public.sessions;
create policy "sessions: admins read"
  on public.sessions for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "sessions: admins update" on public.sessions;
create policy "sessions: admins update"
  on public.sessions for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "sessions: admins delete" on public.sessions;
create policy "sessions: admins delete"
  on public.sessions for delete to authenticated
  using ((select public.is_admin()));

-- Practitioners: only sessions assigned to them, and they cannot reassign a
-- session to someone else.
drop policy if exists "sessions: practitioners read assigned" on public.sessions;
create policy "sessions: practitioners read assigned"
  on public.sessions for select to authenticated
  using (
    practitioner_id in (
      select p.id from public.practitioners p where p.user_id = (select auth.uid())
    )
  );

drop policy if exists "sessions: practitioners update assigned" on public.sessions;
create policy "sessions: practitioners update assigned"
  on public.sessions for update to authenticated
  using (
    practitioner_id in (
      select p.id from public.practitioners p where p.user_id = (select auth.uid())
    )
  )
  with check (
    practitioner_id in (
      select p.id from public.practitioners p where p.user_id = (select auth.uid())
    )
  );

-- Clients: their own bookings only. Cancellation goes through
-- client_cancel_session() so clients cannot edit other fields.
drop policy if exists "sessions: clients read own" on public.sessions;
create policy "sessions: clients read own"
  on public.sessions for select to authenticated
  using (client_user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists sessions_touch_updated_at on public.sessions;
create trigger sessions_touch_updated_at
  before update on public.sessions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Status history (audit trail)
-- ---------------------------------------------------------------------------
create table if not exists public.session_status_history (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.sessions (id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_by  uuid,
  changed_at  timestamptz not null default now()
);

create index if not exists session_status_history_session_idx
  on public.session_status_history (session_id);

alter table public.session_status_history enable row level security;

drop policy if exists "session_status_history: admins read" on public.session_status_history;
create policy "session_status_history: admins read"
  on public.session_status_history for select to authenticated
  using ((select public.is_admin()));
-- No insert/update/delete policies: rows are written only by the trigger below.

create or replace function public.record_session_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.session_status_history (session_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, (select auth.uid()));
  elsif new.status is distinct from old.status then
    insert into public.session_status_history (session_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

revoke execute on function public.record_session_status_change() from public;

drop trigger if exists sessions_record_status on public.sessions;
create trigger sessions_record_status
  after insert or update of status on public.sessions
  for each row execute function public.record_session_status_change();

-- ---------------------------------------------------------------------------
-- Availability
-- Simple weekly template matching the legacy website: Monday–Friday, eight
-- one-hour slots, lunch break at 1 PM. `slot_time` uses the same '09:00 AM'
-- text format as sessions.time so the two can be compared directly.
-- ---------------------------------------------------------------------------
create table if not exists public.availability_slots (
  weekday   smallint not null check (weekday between 0 and 6),  -- 0 = Sunday
  slot_time text     not null check (slot_time ~ '^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$'),
  active    boolean  not null default true,
  primary key (weekday, slot_time)
);

alter table public.availability_slots enable row level security;

drop policy if exists "availability_slots: public read" on public.availability_slots;
create policy "availability_slots: public read"
  on public.availability_slots for select to anon, authenticated
  using (true);

drop policy if exists "availability_slots: admins manage" on public.availability_slots;
create policy "availability_slots: admins manage"
  on public.availability_slots for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.availability_slots (weekday, slot_time)
select d, t
from generate_series(1, 5) as d,
     unnest(array['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']) as t
on conflict do nothing;

-- Closed days (holidays, leave). `reason` is internal and never exposed.
create table if not exists public.availability_exceptions (
  id              bigint generated always as identity primary key,
  "date"          date not null,
  practitioner_id text references public.practitioners (id) on delete cascade,
  reason          text check (reason is null or char_length(reason) <= 200),
  closed          boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists availability_exceptions_date_idx on public.availability_exceptions ("date");

alter table public.availability_exceptions enable row level security;

drop policy if exists "availability_exceptions: admins manage" on public.availability_exceptions;
create policy "availability_exceptions: admins manage"
  on public.availability_exceptions for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- PII-free availability RPCs
-- ---------------------------------------------------------------------------
create or replace function public.get_booked_slots(from_date date, to_date date)
returns table ("date" date, "time" text)
language sql
stable
security definer
set search_path = ''
as $$
  select s."date", s."time"
  from public.sessions s
  where s.status in ('pending', 'confirmed')
    and s."date" between from_date and to_date
    and to_date - from_date <= 120
  group by s."date", s."time";
$$;

comment on function public.get_booked_slots(date, date) is
  'Returns taken (date, time) pairs only — no names, contacts or services. Range capped at 120 days.';

create or replace function public.get_closed_dates(from_date date, to_date date)
returns table ("date" date)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct e."date"
  from public.availability_exceptions e
  where e.closed
    and e.practitioner_id is null
    and e."date" between from_date and to_date
    and to_date - from_date <= 366;
$$;

revoke execute on function public.get_booked_slots(date, date) from public;
revoke execute on function public.get_closed_dates(date, date) from public;
grant execute on function public.get_booked_slots(date, date) to anon, authenticated;
grant execute on function public.get_closed_dates(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Client self-service cancellation
-- Returns true when a booking was cancelled, false otherwise (not theirs, in
-- the past, or already closed). Never reveals whether another person's
-- booking exists.
-- ---------------------------------------------------------------------------
create or replace function public.client_cancel_session(session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_count int;
begin
  if v_uid is null then
    return false;
  end if;

  update public.sessions s
     set status = 'cancelled',
         cancelled_at = now()
   where s.id = client_cancel_session.session_id
     and s.client_user_id = v_uid
     and s."date" >= current_date
     and s.status in ('pending', 'confirmed');

  get diagnostics v_count = row_count;
  return v_count = 1;
end;
$$;

revoke execute on function public.client_cancel_session(uuid) from public;
grant execute on function public.client_cancel_session(uuid) to authenticated;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000003_blog_posts_rls.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- =============================================================================
-- 20261027000003 — Resources (blog_posts) and settings access control
--
-- Purpose
--   - The public site previously incremented view counts with a direct
--     anonymous UPDATE on blog_posts, which requires a policy letting anyone
--     update posts (including their content). Replaced by a narrow RPC.
--   - Public visitors may read published posts only; drafts stay private.
--   - Adds editorial review metadata so unreviewed material can be labelled.
--   - settings (notification e-mail etc.) becomes admin-only.
--
-- Operator check: permissive policies created by hand in the dashboard are not
-- removed by this file because their names are unknown. Review and drop any
-- remaining anon UPDATE/INSERT/DELETE policies:
--   select policyname, roles, cmd from pg_policies
--   where schemaname = 'public' and tablename in ('blog_posts', 'settings');
--
-- Idempotent and non-destructive.
-- =============================================================================

alter table public.blog_posts add column if not exists slug        text;
alter table public.blog_posts add column if not exists reviewed_by text check (reviewed_by is null or char_length(reviewed_by) <= 120);
alter table public.blog_posts add column if not exists reviewed_at timestamptz;

create unique index if not exists blog_posts_slug_unique on public.blog_posts (slug) where slug is not null;
create index if not exists blog_posts_status_idx on public.blog_posts (status);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts: public read published" on public.blog_posts;
create policy "blog_posts: public read published"
  on public.blog_posts for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

drop policy if exists "blog_posts: admins insert" on public.blog_posts;
create policy "blog_posts: admins insert"
  on public.blog_posts for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "blog_posts: admins update" on public.blog_posts;
create policy "blog_posts: admins update"
  on public.blog_posts for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "blog_posts: admins delete" on public.blog_posts;
create policy "blog_posts: admins delete"
  on public.blog_posts for delete to authenticated
  using ((select public.is_admin()));

-- Narrow view counter: increments only published posts, touches nothing else.
create or replace function public.increment_post_views(post_id uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  update public.blog_posts
     set views = coalesce(views, 0) + 1
   where id = increment_post_views.post_id
     and status = 'published';
$$;

revoke execute on function public.increment_post_views(uuid) from public;
grant execute on function public.increment_post_views(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- settings: admin-only (holds the notification e-mail address)
-- Edge functions read it with the service role, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.settings enable row level security;

drop policy if exists "settings: admins read" on public.settings;
create policy "settings: admins read"
  on public.settings for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "settings: admins write" on public.settings;
create policy "settings: admins write"
  on public.settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000004_persona_and_reflections.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- =============================================================================
-- 20261027000004 — Private reflections, saved Persona journeys, practitioner
--                  notes and audit events
--
-- Privacy model
--   - Imela Persona conversations are NOT stored on the server by default.
--     They live in browser memory for the duration of the visit only.
--   - A signed-in person may explicitly choose to save a *summary* of a Persona
--     journey (persona_saved_journeys). Saving requires a recorded consent
--     timestamp and expires automatically after 90 days.
--   - client_reflections are private journal entries: readable by their author
--     only. Practitioners and admins have NO access.
--   - practitioner_notes are readable by the authoring practitioner, and only
--     while they remain assigned to the session. Admins have NO access by
--     default; add a policy only if a documented operational duty requires it.
--   - audit_events records sensitive administrative actions (admin read-only).
--
-- Idempotent and non-destructive.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Client reflections (owner-only)
-- ---------------------------------------------------------------------------
create table if not exists public.client_reflections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 5000),
  mood       text check (mood is null or char_length(mood) <= 40),
  created_at timestamptz not null default now()
);

create index if not exists client_reflections_user_idx on public.client_reflections (user_id, created_at desc);

alter table public.client_reflections enable row level security;

drop policy if exists "client_reflections: owner select" on public.client_reflections;
create policy "client_reflections: owner select"
  on public.client_reflections for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "client_reflections: owner insert" on public.client_reflections;
create policy "client_reflections: owner insert"
  on public.client_reflections for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "client_reflections: owner update" on public.client_reflections;
create policy "client_reflections: owner update"
  on public.client_reflections for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "client_reflections: owner delete" on public.client_reflections;
create policy "client_reflections: owner delete"
  on public.client_reflections for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Saved Persona journeys (explicit opt-in, owner-only, auto-expiring)
-- `summary` holds the person's own selections and the recommended service
-- ids — not the raw conversation transcript.
-- ---------------------------------------------------------------------------
create table if not exists public.persona_saved_journeys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  summary      jsonb not null check (pg_column_size(summary) <= 16384),
  consented_at timestamptz not null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '90 days')
);

create index if not exists persona_saved_journeys_user_idx on public.persona_saved_journeys (user_id);
create index if not exists persona_saved_journeys_expires_idx on public.persona_saved_journeys (expires_at);

alter table public.persona_saved_journeys enable row level security;

drop policy if exists "persona_saved_journeys: owner select" on public.persona_saved_journeys;
create policy "persona_saved_journeys: owner select"
  on public.persona_saved_journeys for select to authenticated
  using (user_id = (select auth.uid()) and expires_at > now());

drop policy if exists "persona_saved_journeys: owner insert" on public.persona_saved_journeys;
create policy "persona_saved_journeys: owner insert"
  on public.persona_saved_journeys for insert to authenticated
  with check (user_id = (select auth.uid()) and consented_at is not null);

drop policy if exists "persona_saved_journeys: owner delete" on public.persona_saved_journeys;
create policy "persona_saved_journeys: owner delete"
  on public.persona_saved_journeys for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.purge_expired_persona_journeys()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.persona_saved_journeys where expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.purge_expired_persona_journeys() from public, anon, authenticated;

-- Schedule daily with pg_cron (enable the extension in the dashboard first):
--   select cron.schedule('purge-persona-journeys', '17 3 * * *',
--                        $$select public.purge_expired_persona_journeys()$$);

-- ---------------------------------------------------------------------------
-- Practitioner notes (author + assignment only)
-- ---------------------------------------------------------------------------
create table if not exists public.practitioner_notes (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  author_id  uuid not null default auth.uid() references auth.users (id) on delete restrict,
  body       text not null check (char_length(body) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists practitioner_notes_session_idx on public.practitioner_notes (session_id);
create index if not exists practitioner_notes_author_idx on public.practitioner_notes (author_id);

alter table public.practitioner_notes enable row level security;

-- True when the current user is the practitioner assigned to the session.
create or replace function public.is_assigned_practitioner(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sessions s
    join public.practitioners p on p.id = s.practitioner_id
    where s.id = p_session_id
      and p.user_id = (select auth.uid())
      and p.active
  );
$$;

revoke execute on function public.is_assigned_practitioner(uuid) from public;
grant execute on function public.is_assigned_practitioner(uuid) to authenticated;

drop policy if exists "practitioner_notes: author read" on public.practitioner_notes;
create policy "practitioner_notes: author read"
  on public.practitioner_notes for select to authenticated
  using (author_id = (select auth.uid()) and (select public.is_assigned_practitioner(session_id)));

drop policy if exists "practitioner_notes: author insert" on public.practitioner_notes;
create policy "practitioner_notes: author insert"
  on public.practitioner_notes for insert to authenticated
  with check (author_id = (select auth.uid()) and (select public.is_assigned_practitioner(session_id)));

drop policy if exists "practitioner_notes: author update" on public.practitioner_notes;
create policy "practitioner_notes: author update"
  on public.practitioner_notes for update to authenticated
  using (author_id = (select auth.uid()) and (select public.is_assigned_practitioner(session_id)))
  with check (author_id = (select auth.uid()) and (select public.is_assigned_practitioner(session_id)));

drop trigger if exists practitioner_notes_touch_updated_at on public.practitioner_notes;
create trigger practitioner_notes_touch_updated_at
  before update on public.practitioner_notes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Audit events (admin read-only; written via log_audit)
-- metadata must never contain clinical content or free-text messages.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_events (
  id         bigint generated always as identity primary key,
  actor      uuid,
  action     text not null check (char_length(action) <= 80),
  entity     text not null check (char_length(entity) <= 80),
  entity_id  text check (entity_id is null or char_length(entity_id) <= 120),
  metadata   jsonb not null default '{}'::jsonb check (pg_column_size(metadata) <= 4096),
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_idx on public.audit_events (created_at desc);

alter table public.audit_events enable row level security;

drop policy if exists "audit_events: admins read" on public.audit_events;
create policy "audit_events: admins read"
  on public.audit_events for select to authenticated
  using ((select public.is_admin()));

create or replace function public.log_audit(
  p_action text,
  p_entity text,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only staff actions are audited through this entry point.
  if not (public.has_role('admin') or public.has_role('practitioner')) then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  insert into public.audit_events (actor, action, entity, entity_id, metadata)
  values ((select auth.uid()), p_action, p_entity, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

revoke execute on function public.log_audit(text, text, text, jsonb) from public;
grant execute on function public.log_audit(text, text, text, jsonb) to authenticated;


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000005_organisations.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261027000006_enquiries.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- =============================================================================
-- 20261027000006 — Enquiries (consultation requests and contact messages)
--
-- Purpose
--   Stores requests that are not slot bookings: organisational programme
--   enquiries, individual services booked "by enquiry" (e.g. family sessions)
--   and general contact messages. Previously the contact form only logged to
--   the browser console and nothing reached Imela.
--
-- Website contract
--   INSERT with a client-generated id (crypto.randomUUID()) and NO `.select()`
--   — anonymous visitors have no SELECT access to this table.
--
-- Idempotent and non-destructive.
-- =============================================================================

create table if not exists public.enquiries (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in ('organisation', 'individual', 'general')),
  service_id        text check (service_id is null or char_length(service_id) <= 80),
  name              text not null check (char_length(name) between 1 and 120),
  email             text not null check (char_length(email) <= 254 and email like '%@%'),
  phone             text check (phone is null or char_length(phone) <= 32),
  organisation      text check (organisation is null or char_length(organisation) <= 160),
  team_size         text check (team_size is null or char_length(team_size) <= 40),
  preferred_contact text check (preferred_contact is null or preferred_contact in ('email', 'phone')),
  message           text check (message is null or char_length(message) <= 2000),
  status            text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at        timestamptz not null default now()
);

create index if not exists enquiries_status_created_idx on public.enquiries (status, created_at desc);

alter table public.enquiries enable row level security;

drop policy if exists "enquiries: public create new" on public.enquiries;
create policy "enquiries: public create new"
  on public.enquiries for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "enquiries: admins read" on public.enquiries;
create policy "enquiries: admins read"
  on public.enquiries for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "enquiries: admins update" on public.enquiries;
create policy "enquiries: admins update"
  on public.enquiries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- 20261028000007_persona_portal.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- =============================================================================
-- 0007 · Imela Persona — anonymous counselling portal
--
-- A person gets a Persona ID (identifies their space) and a recovery secret
-- (proves access). Each Persona is a Supabase Auth user created by the
-- `persona-register` Edge Function with a synthetic, undeliverable login
-- address; the secret is its password, so only a one-way hash is stored.
--
-- Design rules enforced here, in the database:
--   * No identity fields. Nothing in these tables asks for or stores a name,
--     email, phone number, IP address or device fingerprint.
--   * A Persona can only ever read its own profile, cases, messages and
--     assigned resources. Internal notes are never visible to Personas.
--   * Staff (admins, practitioners) change cases only through audited
--     SECURITY DEFINER functions — there is no direct UPDATE policy.
--   * Triage is rule-based and transparent (persona_triage_rules), and a
--     risk-language screen only ever *raises* a case for priority human
--     review. It never closes, downgrades or answers a case on its own.
--   * Messages are append-only.
--   * Rate limits live in triggers so they cannot be bypassed by a client.
--
-- Requires migrations 0001 (roles) and 0004 (audit_events).
-- Idempotent and non-destructive: safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Vocabulary
-- -----------------------------------------------------------------------------
create or replace function public.persona_concerns()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'stress-anxiety', 'relationships-family', 'grief-loss', 'academic-pressure',
    'work-financial', 'emotional-wellbeing', 'self-esteem-growth', 'other-unsure'
  ]::text[];
$$;

-- -----------------------------------------------------------------------------
-- Personas
-- -----------------------------------------------------------------------------
create table if not exists public.persona_profiles (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  persona_code   text not null unique
                 check (persona_code ~ '^IMP-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$'),
  created_at     timestamptz not null default now(),
  -- Day granularity only: enough for retention, not for tracking.
  last_active_on date
);

comment on table public.persona_profiles is
  'Pseudonymous identities. Created only by the persona-register Edge Function (service role). Contains no personal data.';

alter table public.persona_profiles enable row level security;

create or replace function public.is_persona()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.persona_profiles p where p.user_id = (select auth.uid()));
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('admin') or public.has_role('practitioner');
$$;

revoke execute on function public.is_persona() from public;
revoke execute on function public.is_staff() from public;
grant execute on function public.is_persona() to authenticated;
grant execute on function public.is_staff() to authenticated;

drop policy if exists "persona_profiles: own" on public.persona_profiles;
create policy "persona_profiles: own"
  on public.persona_profiles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "persona_profiles: staff read" on public.persona_profiles;
create policy "persona_profiles: staff read"
  on public.persona_profiles for select to authenticated
  using ((select public.is_staff()));

-- A Persona login must never be granted a staff role.
create or replace function public.prevent_persona_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.persona_profiles p where p.user_id = new.user_id) then
    raise exception 'Persona identities cannot hold roles' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists user_roles_no_personas on public.user_roles;
create trigger user_roles_no_personas
  before insert or update on public.user_roles
  for each row execute function public.prevent_persona_roles();

-- -----------------------------------------------------------------------------
-- Transparent triage rules (staff read, admins edit)
-- -----------------------------------------------------------------------------
create table if not exists public.persona_triage_rules (
  concern       text primary key check (concern = any (public.persona_concerns())),
  queue         text not null check (char_length(queue) between 1 and 60),
  base_urgency  text not null default 'routine' check (base_urgency in ('routine', 'priority')),
  active        boolean not null default true,
  updated_at    timestamptz not null default now(),
  updated_by    uuid
);

alter table public.persona_triage_rules enable row level security;

drop policy if exists "persona_triage_rules: staff read" on public.persona_triage_rules;
create policy "persona_triage_rules: staff read"
  on public.persona_triage_rules for select to authenticated
  using ((select public.is_staff()));

drop policy if exists "persona_triage_rules: admins write" on public.persona_triage_rules;
create policy "persona_triage_rules: admins write"
  on public.persona_triage_rules for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into public.persona_triage_rules (concern, queue, base_urgency) values
  ('stress-anxiety',       'emotional-wellbeing', 'routine'),
  ('relationships-family', 'relationships',       'routine'),
  ('grief-loss',           'grief',               'priority'),
  ('academic-pressure',    'young-people',        'routine'),
  ('work-financial',       'workplace',           'routine'),
  ('emotional-wellbeing',  'emotional-wellbeing', 'routine'),
  ('self-esteem-growth',   'personal-growth',     'routine'),
  ('other-unsure',         'general',             'routine')
on conflict (concern) do nothing;

-- -----------------------------------------------------------------------------
-- Risk-language screen (mirrors src/domain/safety.ts). Deliberately high
-- recall: a match only flags the case for priority human review.
-- -----------------------------------------------------------------------------
create or replace function public.persona_risk_screen(p_text text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_text, '') ~* any (array[
    'suicid',
    'kill(ing)? ?my ?self',
    'end(ing)? (it all|my life|everything)',
    'take my (own )?life',
    '(want|wanna|going|plan(ning)?) to die',
    'wish i (was|were) dead',
    'better off (dead|without me)',
    'no (reason|point) (to|in) (live|living|go on)',
    'don''?t want to (live|be alive|exist|be here anymore|wake up)',
    'self[ -]?harm',
    '(hurt|hurting|harm|harming|cut|cutting|burn|burning) my ?self',
    'not worth living',
    'kujiua', 'nataka kufa', 'nitajiua',
    '(hits?|beats?|chokes?|kicks?|rapes?|raped|abuses?|abused) me',
    '(i am|i''m|im|being) (abused|beaten|raped|assaulted|threatened)',
    'not safe at home',
    '(afraid|scared) for my (life|safety)',
    '(going|wants?|threaten(ed|s)?) to (kill|hurt) me',
    'domestic (violence|abuse)',
    '(want|going|plan(ning)?) to (kill|hurt|harm|stab|shoot) (him|her|them|someone|somebody)',
    'overdos(e|ed|ing)',
    'took (too many|a lot of) (pills|tablets)'
  ]);
$$;

-- -----------------------------------------------------------------------------
-- Cases
-- -----------------------------------------------------------------------------
create table if not exists public.persona_cases (
  id                    uuid primary key default gen_random_uuid(),
  persona_user_id       uuid not null default auth.uid() references public.persona_profiles (user_id) on delete cascade,
  concerns              text[] not null
                        check (cardinality(concerns) between 1 and 8 and concerns <@ public.persona_concerns()),
  story                 text check (story is null or char_length(story) <= 6000),
  preferred_support     text not null default 'not_sure'
                        check (preferred_support in ('written', 'group', 'specialist', 'not_sure')),
  status                text not null default 'awaiting_review'
                        check (status in ('awaiting_review', 'in_progress', 'counsellor_replied', 'closed')),
  urgency               text not null default 'routine' check (urgency in ('routine', 'priority', 'crisis_review')),
  urgency_reason        text check (urgency_reason is null or char_length(urgency_reason) <= 200),
  urgency_set_by        uuid,
  queue                 text not null default 'general',
  assigned_to           uuid references auth.users (id) on delete set null,
  follow_up_on          date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_persona_activity timestamptz not null default now(),
  first_response_at     timestamptz,
  last_staff_reply_at   timestamptz,
  closed_at             timestamptz
);

create index if not exists persona_cases_persona_idx on public.persona_cases (persona_user_id, created_at desc);
create index if not exists persona_cases_queue_idx on public.persona_cases (status, urgency, created_at);
create index if not exists persona_cases_assigned_idx on public.persona_cases (assigned_to, status);

alter table public.persona_cases enable row level security;

-- Which staff may see a case: admins all; practitioners their own and the
-- unassigned queue (so they can pick cases up).
create or replace function public.staff_can_access_case(p_case uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
      or (public.has_role('practitioner') and exists (
            select 1 from public.persona_cases c
            where c.id = p_case and (c.assigned_to = (select auth.uid()) or c.assigned_to is null)));
$$;

-- Which staff may *act* on a case (reply, add notes): admins, or the assignee.
create or replace function public.staff_can_act_on_case(p_case uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
      or (public.has_role('practitioner') and exists (
            select 1 from public.persona_cases c where c.id = p_case and c.assigned_to = (select auth.uid())));
$$;

revoke execute on function public.staff_can_access_case(uuid) from public;
revoke execute on function public.staff_can_act_on_case(uuid) from public;
grant execute on function public.staff_can_access_case(uuid) to authenticated;
grant execute on function public.staff_can_act_on_case(uuid) to authenticated;

-- Personas do NOT read the base table: it holds internal triage fields
-- (urgency, reason, queue, assignee). They read persona_my_cases instead.
drop policy if exists "persona_cases: persona reads own" on public.persona_cases;

create or replace function public.persona_owns_case(p_case uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.persona_cases c where c.id = p_case and c.persona_user_id = (select auth.uid()));
$$;

revoke execute on function public.persona_owns_case(uuid) from public;
grant execute on function public.persona_owns_case(uuid) to authenticated;

drop policy if exists "persona_cases: persona creates own" on public.persona_cases;
create policy "persona_cases: persona creates own"
  on public.persona_cases for insert to authenticated
  with check (persona_user_id = (select auth.uid()) and (select public.is_persona()));

drop policy if exists "persona_cases: staff read" on public.persona_cases;
create policy "persona_cases: staff read"
  on public.persona_cases for select to authenticated
  using ((select public.is_admin()) or ((select public.has_role('practitioner')) and (assigned_to = (select auth.uid()) or assigned_to is null)));

-- No UPDATE or DELETE policies: changes go through the functions below.

-- Server-side triage on insert. Client-supplied status/urgency/queue/assignment
-- are ignored; limits are enforced here.
create or replace function public.persona_cases_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_open int;
  v_recent int;
  v_priority boolean;
  v_queue text;
  v_reasons text[] := '{}';
begin
  select count(*) into v_open from public.persona_cases
   where persona_user_id = new.persona_user_id and status <> 'closed';
  if v_open >= 3 then
    raise exception 'You already have 3 open conversations. Please continue in one of those.' using errcode = 'P0001';
  end if;

  select count(*) into v_recent from public.persona_cases
   where persona_user_id = new.persona_user_id and created_at > now() - interval '24 hours';
  if v_recent >= 5 then
    raise exception 'Too many new conversations today. Please try again tomorrow.' using errcode = 'P0001';
  end if;

  new.concerns := array(select distinct unnest(new.concerns));
  new.status := 'awaiting_review';
  new.assigned_to := null;
  new.follow_up_on := null;
  new.urgency_set_by := null;
  new.first_response_at := null;
  new.last_staff_reply_at := null;
  new.closed_at := null;
  new.created_at := now();
  new.updated_at := now();
  new.last_persona_activity := now();

  -- Queue: group pathway first, then the first rule marked priority, then the first concern's rule.
  select exists (
    select 1 from public.persona_triage_rules r
    where r.active and r.concern = any (new.concerns) and r.base_urgency = 'priority'
  ) into v_priority;

  if new.preferred_support = 'group' then
    v_queue := 'group-support';
    v_reasons := array_append(v_reasons, 'prefers group support');
  else
    select r.queue into v_queue
      from public.persona_triage_rules r
      join unnest(new.concerns) with ordinality as c(concern, ord) on c.concern = r.concern
     where r.active
     order by (r.base_urgency = 'priority') desc, c.ord
     limit 1;
  end if;
  new.queue := coalesce(v_queue, 'general');

  if public.persona_risk_screen(new.story) then
    new.urgency := 'crisis_review';
    v_reasons := array_append(v_reasons, 'possible risk language — needs prompt human review');
  elsif v_priority then
    new.urgency := 'priority';
    v_reasons := array_append(v_reasons, 'concern marked priority by triage rules');
  else
    new.urgency := 'routine';
  end if;
  new.urgency_reason := nullif(array_to_string(v_reasons, '; '), '');
  return new;
end;
$$;

drop trigger if exists persona_cases_before_insert on public.persona_cases;
create trigger persona_cases_before_insert
  before insert on public.persona_cases
  for each row execute function public.persona_cases_before_insert();

create or replace function public.persona_case_is_open(p_case uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.persona_cases c where c.id = p_case and c.status <> 'closed');
$$;

revoke execute on function public.persona_case_is_open(uuid) from public;
grant execute on function public.persona_case_is_open(uuid) to authenticated;

-- What a Persona sees about its own cases: no urgency, reason, queue or
-- assignee identity. The view runs with its owner's rights and filters on
-- auth.uid() itself, so it only ever returns the caller's rows.
create or replace view public.persona_my_cases as
  select c.id,
         c.concerns,
         c.story,
         c.preferred_support,
         c.status,
         (c.assigned_to is not null) as has_counsellor,
         c.created_at,
         c.updated_at,
         c.last_staff_reply_at,
         c.closed_at
    from public.persona_cases c
   where c.persona_user_id = (select auth.uid());

revoke all on public.persona_my_cases from public, anon;
grant select on public.persona_my_cases to authenticated;

-- -----------------------------------------------------------------------------
-- Messages (append-only)
-- -----------------------------------------------------------------------------
create table if not exists public.persona_messages (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.persona_cases (id) on delete cascade,
  sender_role text not null check (sender_role in ('persona', 'counsellor', 'system')),
  sender_id   uuid default auth.uid(),
  body        text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at  timestamptz not null default now()
);

create index if not exists persona_messages_case_idx on public.persona_messages (case_id, created_at);

alter table public.persona_messages enable row level security;

drop policy if exists "persona_messages: persona reads own" on public.persona_messages;
create policy "persona_messages: persona reads own"
  on public.persona_messages for select to authenticated
  using ((select public.persona_owns_case(case_id)));

drop policy if exists "persona_messages: persona writes own" on public.persona_messages;
create policy "persona_messages: persona writes own"
  on public.persona_messages for insert to authenticated
  with check (
    sender_role = 'persona'
    and sender_id = (select auth.uid())
    and (select public.persona_owns_case(case_id))
    and (select public.persona_case_is_open(case_id))
  );

drop policy if exists "persona_messages: staff read" on public.persona_messages;
create policy "persona_messages: staff read"
  on public.persona_messages for select to authenticated
  using ((select public.staff_can_access_case(case_id)));

drop policy if exists "persona_messages: staff write" on public.persona_messages;
create policy "persona_messages: staff write"
  on public.persona_messages for insert to authenticated
  with check (
    sender_role = 'counsellor'
    and sender_id = (select auth.uid())
    and (select public.staff_can_act_on_case(case_id))
    and (select public.persona_case_is_open(case_id))
  );

create or replace function public.persona_messages_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recent int;
begin
  new.created_at := now();
  if new.sender_role = 'persona' then
    select count(*) into v_recent from public.persona_messages
     where sender_id = new.sender_id and sender_role = 'persona' and created_at > now() - interval '1 hour';
    if v_recent >= 30 then
      raise exception 'You have sent a lot of messages in the last hour. Please wait a little before sending more.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists persona_messages_before_insert on public.persona_messages;
create trigger persona_messages_before_insert
  before insert on public.persona_messages
  for each row execute function public.persona_messages_before_insert();

-- Keep case status and timestamps in step with the conversation.
create or replace function public.persona_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sender_role = 'persona' then
    update public.persona_cases c
       set last_persona_activity = now(),
           updated_at = now(),
           status = case when c.status = 'counsellor_replied' then 'in_progress' else c.status end,
           urgency = case when public.persona_risk_screen(new.body) then 'crisis_review' else c.urgency end,
           urgency_reason = case when public.persona_risk_screen(new.body)
                                 then 'possible risk language in a new message — needs prompt human review'
                                 else c.urgency_reason end
     where c.id = new.case_id;
    update public.persona_profiles set last_active_on = current_date where user_id = new.sender_id;
  elsif new.sender_role = 'counsellor' then
    update public.persona_cases c
       set status = 'counsellor_replied',
           last_staff_reply_at = now(),
           first_response_at = coalesce(c.first_response_at, now()),
           updated_at = now()
     where c.id = new.case_id;
    insert into public.audit_events (actor, action, entity, entity_id)
    values (new.sender_id, 'reply', 'persona_case', new.case_id::text);
  end if;
  return new;
end;
$$;

drop trigger if exists persona_messages_after_insert on public.persona_messages;
create trigger persona_messages_after_insert
  after insert on public.persona_messages
  for each row execute function public.persona_messages_after_insert();

-- -----------------------------------------------------------------------------
-- Internal case notes — staff only, never visible to Personas
-- -----------------------------------------------------------------------------
create table if not exists public.persona_case_notes (
  id         uuid primary key default gen_random_uuid(),
  case_id    uuid not null references public.persona_cases (id) on delete cascade,
  author_id  uuid not null default auth.uid(),
  body       text not null check (char_length(btrim(body)) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists persona_case_notes_case_idx on public.persona_case_notes (case_id, created_at);

alter table public.persona_case_notes enable row level security;

drop policy if exists "persona_case_notes: staff read" on public.persona_case_notes;
create policy "persona_case_notes: staff read"
  on public.persona_case_notes for select to authenticated
  using ((select public.staff_can_access_case(case_id)));

drop policy if exists "persona_case_notes: staff write" on public.persona_case_notes;
create policy "persona_case_notes: staff write"
  on public.persona_case_notes for insert to authenticated
  with check (author_id = (select auth.uid()) and (select public.staff_can_act_on_case(case_id)));

-- -----------------------------------------------------------------------------
-- Resources assigned to a case
-- -----------------------------------------------------------------------------
create table if not exists public.persona_case_resources (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.persona_cases (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  url         text not null check (char_length(url) <= 500 and (url ~ '^/[^/]' or url ~ '^https://')),
  note        text check (note is null or char_length(note) <= 500),
  assigned_by uuid not null default auth.uid(),
  created_at  timestamptz not null default now()
);

create index if not exists persona_case_resources_case_idx on public.persona_case_resources (case_id, created_at);

alter table public.persona_case_resources enable row level security;

drop policy if exists "persona_case_resources: persona reads own" on public.persona_case_resources;
create policy "persona_case_resources: persona reads own"
  on public.persona_case_resources for select to authenticated
  using ((select public.persona_owns_case(case_id)));

drop policy if exists "persona_case_resources: staff read" on public.persona_case_resources;
create policy "persona_case_resources: staff read"
  on public.persona_case_resources for select to authenticated
  using ((select public.staff_can_access_case(case_id)));

drop policy if exists "persona_case_resources: staff write" on public.persona_case_resources;
create policy "persona_case_resources: staff write"
  on public.persona_case_resources for insert to authenticated
  with check (assigned_by = (select auth.uid()) and (select public.staff_can_act_on_case(case_id)));

-- -----------------------------------------------------------------------------
-- Persona actions
-- -----------------------------------------------------------------------------
create or replace function public.persona_close_case(p_case uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.persona_cases
     set status = 'closed', closed_at = now(), updated_at = now()
   where id = p_case and persona_user_id = (select auth.uid()) and status <> 'closed';
  if not found then
    raise exception 'not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.persona_close_case(uuid) from public;
grant execute on function public.persona_close_case(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Staff actions — all audited. Never contain counselling content in metadata.
-- -----------------------------------------------------------------------------
create or replace function public.persona_audit(p_action text, p_case uuid, p_metadata jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_events (actor, action, entity, entity_id, metadata)
  values ((select auth.uid()), p_action, 'persona_case', p_case::text, coalesce(p_metadata, '{}'::jsonb));
$$;

revoke execute on function public.persona_audit(text, uuid, jsonb) from public;

-- Called whenever a staff member opens a case, so access is auditable.
create or replace function public.staff_open_case(p_case uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.staff_can_access_case(p_case) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  perform public.persona_audit('view', p_case);
end;
$$;

create or replace function public.staff_assign_case(p_case uuid, p_assignee uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current uuid;
begin
  select assigned_to into v_current from public.persona_cases where id = p_case for update;
  if not found then
    raise exception 'not found' using errcode = 'P0002';
  end if;

  if public.is_admin() then
    if p_assignee is not null and not exists (
      select 1 from public.user_roles r where r.user_id = p_assignee and r.role in ('practitioner', 'admin')
    ) then
      raise exception 'assignee must be a counsellor' using errcode = '22023';
    end if;
  elsif public.has_role('practitioner') then
    -- Practitioners may only pick up unassigned cases for themselves.
    if v_current is not null or p_assignee is distinct from (select auth.uid()) then
      raise exception 'not authorised' using errcode = '42501';
    end if;
  else
    raise exception 'not authorised' using errcode = '42501';
  end if;

  update public.persona_cases
     set assigned_to = p_assignee,
         status = case when p_assignee is not null and status = 'awaiting_review' then 'in_progress' else status end,
         updated_at = now()
   where id = p_case;
  perform public.persona_audit('assign', p_case, jsonb_build_object('assignee', p_assignee));
end;
$$;

create or replace function public.staff_set_case_status(p_case uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('awaiting_review', 'in_progress', 'counsellor_replied', 'closed') then
    raise exception 'invalid status' using errcode = '22023';
  end if;
  if not public.staff_can_act_on_case(p_case) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  update public.persona_cases
     set status = p_status,
         closed_at = case when p_status = 'closed' then now() else null end,
         updated_at = now()
   where id = p_case;
  perform public.persona_audit('status', p_case, jsonb_build_object('status', p_status));
end;
$$;

-- Human override of urgency (up or down), always with a reason.
create or replace function public.staff_set_case_urgency(p_case uuid, p_urgency text, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_urgency not in ('routine', 'priority', 'crisis_review') then
    raise exception 'invalid urgency' using errcode = '22023';
  end if;
  if coalesce(char_length(btrim(p_reason)), 0) = 0 or char_length(p_reason) > 200 then
    raise exception 'a short reason is required' using errcode = '22023';
  end if;
  if not public.staff_can_act_on_case(p_case) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  update public.persona_cases
     set urgency = p_urgency, urgency_reason = 'staff: ' || p_reason, urgency_set_by = (select auth.uid()), updated_at = now()
   where id = p_case;
  perform public.persona_audit('urgency', p_case, jsonb_build_object('urgency', p_urgency));
end;
$$;

create or replace function public.staff_set_follow_up(p_case uuid, p_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.staff_can_act_on_case(p_case) then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  update public.persona_cases set follow_up_on = p_date, updated_at = now() where id = p_case;
  perform public.persona_audit('follow_up', p_case, jsonb_build_object('date', p_date));
end;
$$;

-- Audit inserts of notes and resources (content itself is never copied).
create or replace function public.persona_staff_audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (actor, action, entity, entity_id)
  values ((select auth.uid()), tg_argv[0], 'persona_case', new.case_id::text);
  return new;
end;
$$;

drop trigger if exists persona_case_notes_audit on public.persona_case_notes;
create trigger persona_case_notes_audit after insert on public.persona_case_notes
  for each row execute function public.persona_staff_audit_trigger('note');

drop trigger if exists persona_case_resources_audit on public.persona_case_resources;
create trigger persona_case_resources_audit after insert on public.persona_case_resources
  for each row execute function public.persona_staff_audit_trigger('resource');

-- Workload overview without exposing case content.
create or replace function public.staff_persona_workload()
returns table (assignee uuid, open_cases bigint, awaiting_reply bigint, crisis_review bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  return query
    select c.assigned_to,
           count(*) filter (where c.status <> 'closed'),
           count(*) filter (where c.status in ('awaiting_review', 'in_progress')),
           count(*) filter (where c.urgency = 'crisis_review' and c.status <> 'closed')
      from public.persona_cases c
     group by c.assigned_to;
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.staff_open_case(uuid)',
    'public.staff_assign_case(uuid, uuid)',
    'public.staff_set_case_status(uuid, text)',
    'public.staff_set_case_urgency(uuid, text, text)',
    'public.staff_set_follow_up(uuid, date)',
    'public.staff_persona_workload()'
  ] loop
    execute format('revoke execute on function %s from public', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Retention. Closed cases are deleted after a retention period (default
-- 365 days). Schedule with pg_cron, e.g.:
--   select cron.schedule('persona-retention', '15 2 * * *',
--          $$select public.purge_closed_persona_cases(365)$$);
-- Inactive Persona logins themselves are removed by an operator with the
-- Auth admin API (deleting the auth user cascades to everything above).
-- -----------------------------------------------------------------------------
create or replace function public.purge_closed_persona_cases(p_days int default 365)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_days < 30 then
    raise exception 'retention must be at least 30 days' using errcode = '22023';
  end if;
  delete from public.persona_cases
   where status = 'closed' and closed_at < now() - make_interval(days => p_days);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.purge_closed_persona_cases(integer) from public, anon, authenticated;

