-- =============================================================================
-- Authorization tests for the anonymous counselling portal (migration 0007).
-- Run with scripts/test-db.sh. Any failed assertion aborts with a non-zero
-- exit code (psql ON_ERROR_STOP). Each passing assertion prints "PASS ...".
--
-- Impersonation: inside a transaction,
--   set local role authenticated;
--   select set_config('request.jwt.claim.sub', '<user uuid>', true);
-- =============================================================================
\set ON_ERROR_STOP 1
set client_min_messages = notice;

-- ---------------------------------------------------------------------------
-- Helpers (run as the caller, so impersonation applies)
-- ---------------------------------------------------------------------------
create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

create or replace function tests.pass(p_label text) returns void language plpgsql as $$
begin raise notice 'PASS %', p_label; end $$;

-- Executes p_sql and requires it to fail with one of p_codes.
create or replace function tests.expect_error(p_label text, p_sql text, p_codes text[]) returns void language plpgsql as $$
declare v_state text;
begin
  begin
    execute p_sql;
  exception when others then
    v_state := sqlstate;
  end;
  if v_state is null then
    raise exception 'FAIL % — expected an error (%), statement succeeded', p_label, p_codes using errcode = 'T0001';
  end if;
  if not (v_state = any (p_codes)) then
    raise exception 'FAIL % — expected % but got %', p_label, p_codes, v_state using errcode = 'T0001';
  end if;
  perform tests.pass(p_label);
end $$;

-- Requires p_sql to return the single integer p_expected.
create or replace function tests.expect_int(p_label text, p_sql text, p_expected bigint) returns void language plpgsql as $$
declare v bigint;
begin
  execute p_sql into v;
  if v is distinct from p_expected then
    raise exception 'FAIL % — expected %, got %', p_label, p_expected, v using errcode = 'T0001';
  end if;
  perform tests.pass(p_label);
end $$;

-- Requires p_sql (an UPDATE/DELETE) to affect zero rows and not error.
create or replace function tests.expect_no_rows_changed(p_label text, p_sql text) returns void language plpgsql as $$
declare n bigint;
begin
  execute p_sql;
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'FAIL % — changed % row(s)', p_label, n using errcode = 'T0001';
  end if;
  perform tests.pass(p_label);
end $$;

create or replace function tests.check(p_label text, p_ok boolean) returns void language plpgsql as $$
begin
  if not coalesce(p_ok, false) then raise exception 'FAIL %', p_label using errcode = 'T0001'; end if;
  perform tests.pass(p_label);
end $$;

grant execute on all functions in schema tests to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures (as superuser)
--   A, B   personas          P1, P2 practitioners
--   ADM    admin             U      ordinary signed-in user (no role)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'imp-aaaa-aaaa-aaaa@persona.test.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'imp-bbbb-bbbb-bbbb@persona.test.invalid'),
  ('00000000-0000-0000-0000-0000000000f1', 'p1@staff.test'),
  ('00000000-0000-0000-0000-0000000000f2', 'p2@staff.test'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@staff.test'),
  ('00000000-0000-0000-0000-000000000099', 'someone@example.test');

insert into public.persona_profiles (user_id, persona_code) values
  ('00000000-0000-0000-0000-00000000000a', 'IMP-AAAA-AAAA-AAAA'),
  ('00000000-0000-0000-0000-00000000000b', 'IMP-BBBB-BBBB-BBBB');

insert into public.user_roles (user_id, role) values
  ('00000000-0000-0000-0000-0000000000f1', 'practitioner'),
  ('00000000-0000-0000-0000-0000000000f2', 'practitioner'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin');

insert into public.practitioners (id, user_id, display_name) values
  ('test-p1', '00000000-0000-0000-0000-0000000000f1', 'Practitioner One'),
  ('test-p2', '00000000-0000-0000-0000-0000000000f2', 'Practitioner Two');

-- Case ids used throughout
--   a1: A, stress, client tries to spoof triage fields
--   a2: A, grief-loss          a3: A, group support     a4: A, risk story
--   a5/a6: rate-limit checks   b1: B, routine
\set A '00000000-0000-0000-0000-00000000000a'
\set B '00000000-0000-0000-0000-00000000000b'
\set P1 '00000000-0000-0000-0000-0000000000f1'
\set P2 '00000000-0000-0000-0000-0000000000f2'
\set ADM '00000000-0000-0000-0000-0000000000ad'
\set U '00000000-0000-0000-0000-000000000099'

-- =============================================================================
-- 1. Case creation, server-side triage and validation (as personas)
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);

select tests.expect_error('persona: concerns outside the vocabulary are rejected',
  $$insert into public.persona_cases (concerns) values ('{not-a-concern}')$$, array['23514']);
select tests.expect_error('persona: an empty concern list is rejected',
  $$insert into public.persona_cases (concerns) values ('{}')$$, array['23514']);
select tests.expect_error('persona: story over 6000 characters is rejected',
  $$insert into public.persona_cases (concerns, story) values ('{other-unsure}', repeat('x', 6001))$$, array['23514']);
select tests.expect_error('persona: cannot create a case for someone else',
  format('insert into public.persona_cases (persona_user_id, concerns) values (%L, %L)', '00000000-0000-0000-0000-00000000000b', '{other-unsure}'),
  array['42501']);

insert into public.persona_cases (id, concerns, story, preferred_support, status, urgency, urgency_reason, queue, assigned_to)
values ('11111111-0000-0000-0000-0000000000a1', '{stress-anxiety}', 'Work has been heavy lately.', 'written',
        'closed', 'routine', 'spoofed', 'spoofed-queue', :'P1');
insert into public.persona_cases (id, concerns, story) values ('11111111-0000-0000-0000-0000000000a2', '{grief-loss}', 'My father passed away.');
insert into public.persona_cases (id, concerns, story, preferred_support) values ('11111111-0000-0000-0000-0000000000a3', '{stress-anxiety}', null, 'group');

select tests.expect_error('rate limit: a 4th open case is rejected',
  $$insert into public.persona_cases (concerns) values ('{other-unsure}')$$, array['P0001']);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'B', true);
insert into public.persona_cases (id, concerns, story) values ('22222222-0000-0000-0000-0000000000b1', '{relationships-family}', 'We keep arguing at home.');
commit;

-- Triage results, checked as superuser (personas cannot read these fields).
select tests.check('triage: client-supplied status/urgency/queue/assignee are ignored',
  (select status = 'awaiting_review' and urgency = 'routine' and assigned_to is null
          and queue = 'emotional-wellbeing' and urgency_reason is null
     from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a1'));
select tests.check('triage: grief-loss is priority in the grief queue',
  (select urgency = 'priority' and queue = 'grief' from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a2'));
select tests.check('triage: group preference routes to group-support',
  (select queue = 'group-support' from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a3'));

-- =============================================================================
-- 2. Risk screening and the 24-hour creation limit
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select tests.expect_error('persona_close_case: cannot close another persona''s case',
  $$select public.persona_close_case('22222222-0000-0000-0000-0000000000b1')$$, array['P0002']);
select public.persona_close_case('11111111-0000-0000-0000-0000000000a1');
insert into public.persona_cases (id, concerns, story) values ('11111111-0000-0000-0000-0000000000a4', '{emotional-wellbeing}', 'Honestly I want to end my life.');
commit;

select tests.check('persona_close_case: closes own case',
  (select status = 'closed' and closed_at is not null from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a1'));
select tests.check('risk screen: risk language in the story flags crisis_review with a reason',
  (select urgency = 'crisis_review' and urgency_reason ilike '%risk%' from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a4'));

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select public.persona_close_case('11111111-0000-0000-0000-0000000000a2');
insert into public.persona_cases (id, concerns) values ('11111111-0000-0000-0000-0000000000a5', '{other-unsure}');  -- 5th in 24h
select public.persona_close_case('11111111-0000-0000-0000-0000000000a3');
select tests.expect_int('rate limit precondition: only 2 open cases', $$select count(*) from public.persona_my_cases where status <> 'closed'$$, 2);
select tests.expect_error('rate limit: a 6th case within 24 hours is rejected',
  $$insert into public.persona_cases (concerns) values ('{other-unsure}')$$, array['P0001']);
commit;

-- =============================================================================
-- 3. Isolation between personas
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select tests.expect_int('isolation: persona A sees only its own cases in persona_my_cases',
  $$select count(*) from public.persona_my_cases where id = '22222222-0000-0000-0000-0000000000b1'$$, 0);
select tests.expect_int('isolation: persona A sees its 5 cases',
  $$select count(*) from public.persona_my_cases$$, 5);
select tests.expect_int('isolation: personas cannot read the base persona_cases table (even their own rows)',
  $$select count(*) from public.persona_cases$$, 0);
select tests.expect_int('isolation: persona cannot read triage rules',
  $$select count(*) from public.persona_triage_rules$$, 0);
select tests.expect_int('isolation: persona cannot read audit events',
  $$select count(*) from public.audit_events$$, 0);
commit;

select tests.check('privacy: persona_my_cases exposes no internal triage fields',
  not exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'persona_my_cases'
                 and column_name in ('urgency', 'urgency_reason', 'queue', 'assigned_to', 'urgency_set_by', 'persona_user_id')));

-- =============================================================================
-- 4. Persona messaging rules
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'B', true);
insert into public.persona_messages (case_id, sender_role, sender_id, body)
values ('22222222-0000-0000-0000-0000000000b1', 'persona', :'B', 'Sometimes I think about suicide.');
commit;

select tests.check('risk screen: risk language in a later message escalates the case',
  (select urgency = 'crisis_review' and urgency_reason ilike '%risk%' from public.persona_cases where id = '22222222-0000-0000-0000-0000000000b1'));

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select tests.expect_error('messages: persona cannot write into another persona''s case',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'persona', %L, 'hi')$$,
         '22222222-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000000a'), array['42501']);
select tests.expect_error('messages: persona cannot post as a counsellor',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'counsellor', %L, 'hi')$$,
         '11111111-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-00000000000a'), array['42501']);
select tests.expect_error('messages: persona cannot impersonate another sender_id',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'persona', %L, 'hi')$$,
         '11111111-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-00000000000b'), array['42501']);
select tests.expect_error('messages: persona cannot message a closed case',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'persona', %L, 'hi')$$,
         '11111111-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000000a'), array['42501']);
select tests.expect_int('messages: persona A cannot read B''s messages',
  $$select count(*) from public.persona_messages where case_id = '22222222-0000-0000-0000-0000000000b1'$$, 0);
insert into public.persona_messages (case_id, sender_role, sender_id, body)
values ('11111111-0000-0000-0000-0000000000a4', 'persona', :'A', 'Thank you for reading this.');
select tests.expect_no_rows_changed('immutability: persona cannot update cases',
  $$update public.persona_cases set status = 'closed' where id = '11111111-0000-0000-0000-0000000000a4'$$);
select tests.expect_no_rows_changed('immutability: persona cannot delete cases',
  $$delete from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a4'$$);
select tests.expect_no_rows_changed('immutability: persona cannot edit messages',
  $$update public.persona_messages set body = 'edited'$$);
select tests.expect_no_rows_changed('immutability: persona cannot delete messages',
  $$delete from public.persona_messages$$);
commit;

-- Message rate limit: B has 1 message this hour; 29 more are allowed, the 31st is not.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'B', true);
insert into public.persona_messages (case_id, sender_role, sender_id, body)
select '22222222-0000-0000-0000-0000000000b1', 'persona', :'B', 'message ' || g from generate_series(1, 29) g;
select tests.expect_error('rate limit: the 31st persona message within an hour is rejected',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'persona', %L, 'one more')$$,
         '22222222-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-00000000000b'), array['P0001']);
commit;

-- =============================================================================
-- 5. Staff access and actions
-- =============================================================================
-- Admin assigns B's case to P2.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
select public.staff_assign_case('22222222-0000-0000-0000-0000000000b1', :'P2');
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'P1', true);
select tests.expect_int('staff: practitioner cannot see a case assigned to another practitioner',
  $$select count(*) from public.persona_cases where id = '22222222-0000-0000-0000-0000000000b1'$$, 0);
select tests.expect_int('staff: practitioner cannot read messages of another practitioner''s case',
  $$select count(*) from public.persona_messages where case_id = '22222222-0000-0000-0000-0000000000b1'$$, 0);
select tests.expect_int('staff: practitioner sees the unassigned queue (A''s 5 cases)',
  $$select count(*) from public.persona_cases where assigned_to is null$$, 5);
select tests.expect_int('staff: practitioner can read persona codes for display',
  $$select count(*) from public.persona_profiles$$, 2);
select tests.expect_int('staff: practitioner can read practitioners.user_id for the assignment list',
  $$select count(user_id) from public.practitioners where id in ('test-p1', 'test-p2')$$, 2);
select tests.expect_error('staff: practitioner cannot assign a case to someone else',
  format('select public.staff_assign_case(%L, %L)', '11111111-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000f2'), array['42501']);
select tests.expect_error('staff: practitioner cannot take over an assigned case',
  format('select public.staff_assign_case(%L, %L)', '22222222-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000f1'), array['42501']);
select tests.expect_error('staff: practitioner cannot reply on an unassigned case',
  format($$insert into public.persona_messages (case_id, sender_role, sender_id, body) values (%L, 'counsellor', %L, 'hello')$$,
         '11111111-0000-0000-0000-0000000000a5', '00000000-0000-0000-0000-0000000000f1'), array['42501']);
select tests.expect_error('staff: practitioner cannot add notes to another practitioner''s case',
  format($$insert into public.persona_case_notes (case_id, author_id, body) values (%L, %L, 'note')$$,
         '22222222-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000f1'), array['42501']);
select tests.expect_error('staff: practitioner cannot change status of an unassigned case',
  format('select public.staff_set_case_status(%L, %L)', '11111111-0000-0000-0000-0000000000a5', 'closed'), array['42501']);
select tests.expect_no_rows_changed('staff: no direct UPDATE on cases, even for staff',
  $$update public.persona_cases set urgency = 'routine'$$);

-- Self-assign and work the case.
select public.staff_open_case('11111111-0000-0000-0000-0000000000a4');
select public.staff_assign_case('11111111-0000-0000-0000-0000000000a4', :'P1');
insert into public.persona_messages (case_id, sender_role, sender_id, body)
values ('11111111-0000-0000-0000-0000000000a4', 'counsellor', :'P1', 'COUNSELLOR-REPLY-MARKER thank you for writing.');
insert into public.persona_case_notes (case_id, author_id, body)
values ('11111111-0000-0000-0000-0000000000a4', :'P1', 'INTERNAL-NOTE-MARKER follow up gently.');
insert into public.persona_case_resources (case_id, title, url, assigned_by)
values ('11111111-0000-0000-0000-0000000000a4', 'Grounding when worry spirals', '/resources/grounding-when-worry-spirals', :'P1');
select public.staff_set_case_urgency('11111111-0000-0000-0000-0000000000a4', 'priority', 'spoke with the person; immediate risk not indicated');
select public.staff_set_follow_up('11111111-0000-0000-0000-0000000000a4', current_date + 7);
select tests.expect_error('staff: resource URLs must be relative or https',
  format($$insert into public.persona_case_resources (case_id, title, url, assigned_by) values (%L, 'x', 'javascript:alert(1)', %L)$$,
         '11111111-0000-0000-0000-0000000000a4', '00000000-0000-0000-0000-0000000000f1'), array['23514']);
select tests.expect_error('staff: urgency override requires a reason',
  format('select public.staff_set_case_urgency(%L, %L, %L)', '11111111-0000-0000-0000-0000000000a4', 'routine', ' '), array['22023']);
commit;

select tests.check('workflow: self-assigning moves the case out of awaiting_review',
  (select assigned_to = '00000000-0000-0000-0000-0000000000f1' from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a4'));
select tests.check('workflow: a counsellor reply sets counsellor_replied and first_response_at',
  (select status = 'counsellor_replied' and first_response_at is not null and last_staff_reply_at is not null
     from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a4'));

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select tests.expect_int('persona: sees the counsellor reply in its own thread',
  $$select count(*) from public.persona_messages where case_id = '11111111-0000-0000-0000-0000000000a4' and sender_role = 'counsellor'$$, 1);
select tests.expect_int('persona: sees resources assigned to its own case',
  $$select count(*) from public.persona_case_resources where case_id = '11111111-0000-0000-0000-0000000000a4'$$, 1);
select tests.expect_int('persona: never sees internal case notes',
  $$select count(*) from public.persona_case_notes$$, 0);
select tests.check('persona: view shows a counsellor is assigned, without saying who',
  (select has_counsellor and status = 'counsellor_replied' from public.persona_my_cases where id = '11111111-0000-0000-0000-0000000000a4'));
insert into public.persona_messages (case_id, sender_role, sender_id, body)
values ('11111111-0000-0000-0000-0000000000a4', 'persona', :'A', 'That helps, thank you.');
commit;

select tests.check('workflow: a persona reply after a counsellor reply sets in_progress',
  (select status = 'in_progress' from public.persona_cases where id = '11111111-0000-0000-0000-0000000000a4'));

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'B', true);
select tests.expect_int('isolation: persona B cannot see resources on A''s case',
  $$select count(*) from public.persona_case_resources$$, 0);
commit;

-- Admin can act on any case.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
select tests.expect_int('admin: sees every case', $$select count(*) from public.persona_cases$$, 6);
select public.staff_open_case('22222222-0000-0000-0000-0000000000b1');
insert into public.persona_messages (case_id, sender_role, sender_id, body)
values ('22222222-0000-0000-0000-0000000000b1', 'counsellor', :'ADM', 'We are here for you.');
insert into public.persona_case_notes (case_id, author_id, body)
values ('22222222-0000-0000-0000-0000000000b1', :'ADM', 'Admin note.');
select public.staff_set_case_status('22222222-0000-0000-0000-0000000000b1', 'in_progress');
select tests.expect_int('admin: workload summary is available',
  $$select count(*) from public.staff_persona_workload()$$, 3);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'P1', true);
select tests.expect_error('staff: workload summary is admin-only',
  $$select * from public.staff_persona_workload()$$, array['42501']);
commit;

-- =============================================================================
-- 6. Audit trail
-- =============================================================================
select tests.check('audit: view, assign, reply, note, resource, urgency, follow_up and status are all recorded',
  (select count(distinct action) = 8 from public.audit_events
    where entity = 'persona_case' and action in ('view', 'assign', 'reply', 'note', 'resource', 'urgency', 'follow_up', 'status')));
select tests.check('audit: every persona_case audit row has an actor',
  not exists (select 1 from public.audit_events where entity = 'persona_case' and actor is null));
select tests.check('audit: no counselling content is copied into audit metadata',
  not exists (select 1 from public.audit_events
               where metadata::text ilike '%MARKER%' or metadata::text ilike '%suicide%' or metadata::text ilike '%end my life%'));

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'A', true);
select tests.expect_error('audit: a persona cannot call staff_open_case',
  $$select public.staff_open_case('11111111-0000-0000-0000-0000000000a4')$$, array['42501']);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'U', true);
select tests.expect_error('audit: an ordinary signed-in user cannot call staff_open_case',
  $$select public.staff_open_case('11111111-0000-0000-0000-0000000000a4')$$, array['42501']);
select tests.expect_int('isolation: an ordinary signed-in user sees no cases', $$select count(*) from public.persona_cases$$, 0);
select tests.expect_int('isolation: an ordinary signed-in user sees no persona codes', $$select count(*) from public.persona_profiles$$, 0);
select tests.expect_error('isolation: an ordinary signed-in user cannot open a case (not a persona)',
  $$insert into public.persona_cases (concerns) values ('{other-unsure}')$$, array['42501']);
commit;

-- =============================================================================
-- 7. Roles, anonymous access, maintenance functions
-- =============================================================================
select tests.expect_error('roles: a persona identity cannot be granted a role',
  format($$insert into public.user_roles (user_id, role) values (%L, 'practitioner')$$, '00000000-0000-0000-0000-00000000000a'),
  array['42501']);

begin;
set local role anon;
select tests.expect_int('anon: cannot read persona cases', $$select count(*) from public.persona_cases$$, 0);
select tests.expect_int('anon: cannot read persona messages', $$select count(*) from public.persona_messages$$, 0);
select tests.expect_int('anon: cannot read persona profiles', $$select count(*) from public.persona_profiles$$, 0);
select tests.expect_int('anon: cannot read case notes', $$select count(*) from public.persona_case_notes$$, 0);
select tests.expect_error('anon: cannot read persona_my_cases', $$select count(*) from public.persona_my_cases$$, array['42501']);
select tests.expect_error('anon: cannot create a case', $$insert into public.persona_cases (concerns) values ('{other-unsure}')$$, array['42501', '23502', '23503']);
select tests.expect_error('anon: cannot post a message',
  format($$insert into public.persona_messages (case_id, sender_role, body) values (%L, 'persona', 'hi')$$, '11111111-0000-0000-0000-0000000000a4'),
  array['42501']);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
select tests.expect_error('maintenance: purge_closed_persona_cases is not callable by signed-in users (even admins)',
  $$select public.purge_closed_persona_cases(365)$$, array['42501']);
commit;

select tests.expect_error('maintenance: retention below 30 days is refused',
  $$select public.purge_closed_persona_cases(7)$$, array['22023']);
select tests.expect_int('maintenance: recent closed cases are kept by the default retention',
  $$select public.purge_closed_persona_cases(365)$$, 0);

-- Deleting the auth user removes the persona and everything linked to it.
delete from auth.users where id = '00000000-0000-0000-0000-00000000000b';
select tests.check('deletion: removing a persona login cascades to its cases, messages and notes',
  not exists (select 1 from public.persona_cases where persona_user_id = '00000000-0000-0000-0000-00000000000b')
  and not exists (select 1 from public.persona_messages where case_id = '22222222-0000-0000-0000-0000000000b1')
  and not exists (select 1 from public.persona_case_notes where case_id = '22222222-0000-0000-0000-0000000000b1'));

\echo 'ALL PERSONA PORTAL TESTS PASSED'
