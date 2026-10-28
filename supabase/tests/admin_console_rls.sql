-- =============================================================================
-- Authorization tests for the admin console (migration 0008).
-- Run with scripts/test-db.sh. Uses its own fixtures so it is independent of
-- the other test files.
-- =============================================================================
\set ON_ERROR_STOP 1
set client_min_messages = notice;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

create or replace function tests.pass(p_label text) returns void language plpgsql as $$
begin raise notice 'PASS %', p_label; end $$;

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

create or replace function tests.expect_int(p_label text, p_sql text, p_expected bigint) returns void language plpgsql as $$
declare v bigint;
begin
  execute p_sql into v;
  if v is distinct from p_expected then
    raise exception 'FAIL % — expected %, got %', p_label, p_expected, v using errcode = 'T0001';
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
-- Fixtures: ADM admin, PR practitioner, U ordinary account, PE persona
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('0000000a-0000-0000-0000-0000000000ad', 'console-admin@staff.test'),
  ('0000000a-0000-0000-0000-0000000000f1', 'console-pract@staff.test'),
  ('0000000a-0000-0000-0000-000000000099', 'console-user@example.test'),
  ('0000000a-0000-0000-0000-0000000000ee', 'imp-cccc-cccc-cccc@persona.test.invalid');
insert into public.user_roles (user_id, role) values
  ('0000000a-0000-0000-0000-0000000000ad', 'admin'),
  ('0000000a-0000-0000-0000-0000000000f1', 'practitioner');
insert into public.persona_profiles (user_id, persona_code) values
  ('0000000a-0000-0000-0000-0000000000ee', 'IMP-CCCC-CCCC-CCCC');

\set ADM '0000000a-0000-0000-0000-0000000000ad'
\set PR  '0000000a-0000-0000-0000-0000000000f1'
\set U   '0000000a-0000-0000-0000-000000000099'
\set PE  '0000000a-0000-0000-0000-0000000000ee'

-- =============================================================================
-- 1. Public actions create notifications
-- =============================================================================
begin;
set local role anon;
insert into public.sessions (id, customer_name, email, phone, service, "date", "time", status)
values ('5e550000-0000-0000-0000-000000000001', 'Wanjiru', 'w@example.test', '0700000000', 'individual-adult', current_date + 3, '10:00 AM', 'pending');
insert into public.enquiries (id, kind, name, email, message)
values ('e0000000-0000-0000-0000-000000000001', 'organisation', 'Otieno', 'o@example.test', 'Team workshop please');
commit;

select tests.expect_int('booking request creates one admin notification',
  $$select count(*) from public.admin_notifications where ref_id = '5e550000-0000-0000-0000-000000000001' and kind = 'booking_new' and audience = 'admin'$$, 1);
select tests.expect_int('enquiry creates one admin notification',
  $$select count(*) from public.admin_notifications where ref_id = 'e0000000-0000-0000-0000-000000000001' and kind = 'enquiry_new'$$, 1);
select tests.expect_int('enquiry notification never copies the message',
  $$select count(*) from public.admin_notifications where ref_id = 'e0000000-0000-0000-0000-000000000001' and coalesce(body, '') like '%workshop%'$$, 0);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'PE', true);
insert into public.persona_cases (id, concerns, story) values ('ca5e0000-0000-0000-0000-000000000001', '{grief-loss}', 'A private story that must not be copied.');
insert into public.persona_messages (case_id, sender_role, sender_id, body) values ('ca5e0000-0000-0000-0000-000000000001', 'persona', :'PE', 'Following up.');
commit;

select tests.expect_int('new anonymous case notifies staff',
  $$select count(*) from public.admin_notifications where ref_id = 'ca5e0000-0000-0000-0000-000000000001' and kind = 'case_new' and audience = 'staff'$$, 1);
select tests.expect_int('case notification never copies the story',
  $$select count(*) from public.admin_notifications where ref_id = 'ca5e0000-0000-0000-0000-000000000001' and coalesce(body, '') like '%private story%'$$, 0);
select tests.expect_int('persona message notifies staff',
  $$select count(*) from public.admin_notifications where ref_id = 'ca5e0000-0000-0000-0000-000000000001' and kind = 'case_message'$$, 1);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'PE', true);
insert into public.persona_messages (case_id, sender_role, sender_id, body) values ('ca5e0000-0000-0000-0000-000000000001', 'persona', :'PE', 'I want to end my life');
commit;
select tests.expect_int('risk language raises an urgent case notification',
  $$select count(*) from public.admin_notifications where ref_id = 'ca5e0000-0000-0000-0000-000000000001' and kind = 'case_urgent' and urgent$$, 1);

-- Cancellations: by someone other than an admin → notify; by an admin → silent.
update public.sessions set status = 'cancelled' where id = '5e550000-0000-0000-0000-000000000001';
select tests.expect_int('cancellation by a non-admin notifies',
  $$select count(*) from public.admin_notifications where ref_id = '5e550000-0000-0000-0000-000000000001' and kind = 'booking_cancelled'$$, 1);
update public.sessions set status = 'pending' where id = '5e550000-0000-0000-0000-000000000001';
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
update public.sessions set status = 'cancelled' where id = '5e550000-0000-0000-0000-000000000001';
update public.sessions set status = 'pending' where id = '5e550000-0000-0000-0000-000000000001';
commit;
select tests.expect_int('cancellation by an admin does not notify',
  $$select count(*) from public.admin_notifications where ref_id = '5e550000-0000-0000-0000-000000000001' and kind = 'booking_cancelled'$$, 1);

-- =============================================================================
-- 2. Who can read and change notifications
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
select tests.check('admin sees booking and case notifications',
  (select count(*) from public.admin_notifications where ref_id in ('5e550000-0000-0000-0000-000000000001', 'ca5e0000-0000-0000-0000-000000000001')) >= 3);
select tests.expect_error('admin cannot forge a notification',
  $$insert into public.admin_notifications (kind, title, ref_type, ref_id) values ('booking_new', 'x', 'session', gen_random_uuid())$$, array['42501']);
select tests.expect_error('admin cannot rewrite a notification title',
  $$update public.admin_notifications set title = 'changed'$$, array['42501']);
update public.admin_notifications set read_at = now() where kind = 'enquiry_new';
select tests.expect_int('admin can mark notifications read',
  $$select count(*) from public.admin_notifications where kind = 'enquiry_new' and read_at is null$$, 0);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'PR', true);
select tests.expect_int('practitioner cannot see booking or enquiry notifications',
  $$select count(*) from public.admin_notifications where audience = 'admin'$$, 0);
select tests.check('practitioner sees anonymous case notifications',
  (select count(*) from public.admin_notifications where audience = 'staff') >= 3);
select tests.expect_error('practitioner cannot call admin_summary',
  $$select public.admin_summary()$$, array['42501']);
select tests.expect_error('practitioner cannot manage roles',
  $$select public.admin_set_role('console-user@example.test', 'admin', true)$$, array['42501']);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'U', true);
select tests.expect_int('ordinary account sees no notifications', $$select count(*) from public.admin_notifications$$, 0);
select tests.expect_error('ordinary account cannot list staff', $$select * from public.admin_staff_directory()$$, array['42501']);
commit;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'PE', true);
select tests.expect_int('persona sees no notifications', $$select count(*) from public.admin_notifications$$, 0);
commit;

begin;
set local role anon;
select tests.expect_error('anonymous visitors cannot read notifications', $$select count(*) from public.admin_notifications$$, array['42501']);
commit;

-- =============================================================================
-- 3. Summary and team management (admin)
-- =============================================================================
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'ADM', true);
select tests.check('admin_summary counts pending bookings', (public.admin_summary() ->> 'bookings_pending')::int >= 1);
select tests.check('admin_summary counts open cases', (public.admin_summary() ->> 'cases_open')::int >= 1);
select tests.check('admin_summary returns a 14-day booking series', jsonb_array_length(public.admin_summary() -> 'bookings_by_day') = 14);

select public.admin_set_role('Console-User@Example.test', 'practitioner', true);
select tests.expect_int('admin grants a role by email (case-insensitive)',
  format('select count(*) from public.user_roles where user_id = %L and role = %L', :'U', 'practitioner'), 1);
select tests.check('staff directory lists the new practitioner',
  exists (select 1 from public.admin_staff_directory() where email = 'console-user@example.test' and 'practitioner' = any (roles)));
select public.admin_set_role('console-user@example.test', 'practitioner', false);
select tests.expect_int('admin revokes a role',
  format('select count(*) from public.user_roles where user_id = %L', :'U'), 0);
select tests.expect_error('admin cannot remove their own admin access',
  $$select public.admin_set_role('console-admin@staff.test', 'admin', false)$$, array['42501']);
select tests.expect_error('personas can never be given a staff role',
  $$select public.admin_set_role('imp-cccc-cccc-cccc@persona.test.invalid', 'practitioner', true)$$, array['42501']);
select tests.expect_error('unknown emails are reported',
  $$select public.admin_set_role('nobody@example.test', 'practitioner', true)$$, array['P0002']);
select tests.expect_error('only admin and practitioner roles are managed here',
  $$select public.admin_set_role('console-user@example.test', 'client', true)$$, array['22023']);
select tests.check('role changes are audited',
  (select count(*) from public.audit_events where action in ('role_grant', 'role_revoke') and entity_id = '0000000a-0000-0000-0000-000000000099') = 2);

update public.sessions set admin_note = 'Called to confirm' where id = '5e550000-0000-0000-0000-000000000001';
select tests.expect_int('admin can keep an internal booking note',
  $$select count(*) from public.sessions where admin_note = 'Called to confirm'$$, 1);
commit;

-- Clean up so later test files start from their own fixtures.
delete from public.admin_notifications;
delete from public.sessions where id = '5e550000-0000-0000-0000-000000000001';
delete from public.enquiries where id = 'e0000000-0000-0000-0000-000000000001';
delete from auth.users where id::text like '0000000a-%';
