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
