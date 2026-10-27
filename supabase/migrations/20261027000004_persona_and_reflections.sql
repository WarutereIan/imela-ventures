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
