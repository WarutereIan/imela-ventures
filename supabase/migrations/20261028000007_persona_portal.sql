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
