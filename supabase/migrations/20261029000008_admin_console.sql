-- =============================================================================
-- 20261029000008 — Admin console
--
-- Purpose
--   1. admin_notifications: an in-app inbox for the admin console, filled by
--      triggers whenever something happens on the public side — a booking
--      request, a cancellation, an enquiry, a new anonymous case, a Persona
--      reply or a case flagged for urgent review. Notifications never copy
--      client messages or anonymous case text; they point to the record.
--   2. admin_summary(): one call that returns the dashboard counters.
--   3. Team management without the Supabase dashboard: list staff, grant or
--      revoke the admin / practitioner roles by email, link a practitioner
--      profile. Every change is written to audit_events.
--   4. Internal notes on bookings and enquiries (admins only).
--   5. Realtime: adds the tables the console listens to into the
--      supabase_realtime publication. Realtime still applies RLS, so people
--      only receive changes they are allowed to read.
--
-- Requires migrations 0001–0007. Idempotent and non-destructive: safe to re-run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.admin_notifications (
  id         uuid primary key default gen_random_uuid(),
  -- 'admin': bookings and enquiries (personal data, admins only).
  -- 'staff': anonymous cases (admins and practitioners).
  audience   text not null default 'admin' check (audience in ('admin', 'staff')),
  kind       text not null check (kind in (
               'booking_new', 'booking_cancelled', 'enquiry_new',
               'case_new', 'case_message', 'case_urgent')),
  title      text not null check (char_length(title) <= 140),
  body       text check (body is null or char_length(body) <= 280),
  ref_type   text not null check (ref_type in ('session', 'enquiry', 'persona_case')),
  ref_id     uuid not null,
  urgent     boolean not null default false,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);

create index if not exists admin_notifications_created_idx on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_unread_idx on public.admin_notifications (created_at desc) where read_at is null;

alter table public.admin_notifications enable row level security;

drop policy if exists "admin_notifications: read" on public.admin_notifications;
create policy "admin_notifications: read"
  on public.admin_notifications for select to authenticated
  using (case audience when 'admin' then (select public.is_admin()) else (select public.is_staff()) end);

drop policy if exists "admin_notifications: mark read" on public.admin_notifications;
create policy "admin_notifications: mark read"
  on public.admin_notifications for update to authenticated
  using (case audience when 'admin' then (select public.is_admin()) else (select public.is_staff()) end)
  with check (case audience when 'admin' then (select public.is_admin()) else (select public.is_staff()) end);

drop policy if exists "admin_notifications: admins clear" on public.admin_notifications;
create policy "admin_notifications: admins clear"
  on public.admin_notifications for delete to authenticated
  using ((select public.is_admin()));

-- Rows are only ever created by the triggers below. Staff may change read_at
-- and nothing else.
revoke insert, update on public.admin_notifications from anon, authenticated;
grant update (read_at) on public.admin_notifications to authenticated;
revoke all on public.admin_notifications from anon;

create or replace function public.admin_notify(
  p_audience text, p_kind text, p_title text, p_body text, p_ref_type text, p_ref_id uuid, p_urgent boolean default false
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.admin_notifications (audience, kind, title, body, ref_type, ref_id, urgent)
  values (p_audience, p_kind, left(p_title, 140), left(p_body, 280), p_ref_type, p_ref_id, coalesce(p_urgent, false));
$$;

revoke execute on function public.admin_notify(text, text, text, text, text, uuid, boolean) from public, anon, authenticated;

-- Bookings ------------------------------------------------------------------
create or replace function public.notify_session_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.admin_notify(
      'admin', 'booking_new', 'New booking request',
      concat_ws(' · ', new.customer_name, new.service, to_char(new."date", 'Dy DD Mon') || ' at ' || new."time"),
      'session', new.id);
  elsif new.status = 'cancelled' and old.status is distinct from 'cancelled' and not public.is_admin() then
    -- Only cancellations made by someone other than an admin (e.g. the client).
    perform public.admin_notify(
      'admin', 'booking_cancelled', 'Booking cancelled',
      concat_ws(' · ', new.customer_name, to_char(new."date", 'Dy DD Mon') || ' at ' || new."time"),
      'session', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists sessions_notify_admin on public.sessions;
create trigger sessions_notify_admin
  after insert or update of status on public.sessions
  for each row execute function public.notify_session_change();

-- Enquiries -----------------------------------------------------------------
create or replace function public.notify_enquiry_new()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.admin_notify(
    'admin', 'enquiry_new',
    case new.kind when 'organisation' then 'New workplace enquiry' when 'individual' then 'New service request' else 'New message' end,
    concat_ws(' · ', new.name, new.organisation, new.service_id),
    'enquiry', new.id);
  return new;
end;
$$;

drop trigger if exists enquiries_notify_admin on public.enquiries;
create trigger enquiries_notify_admin
  after insert on public.enquiries
  for each row execute function public.notify_enquiry_new();

-- Anonymous cases (no case text is ever copied) --------------------------------
create or replace function public.notify_persona_case()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.admin_notify(
      'staff', 'case_new',
      case when new.urgency = 'crisis_review' then 'New anonymous case — needs urgent review' else 'New anonymous case' end,
      array_to_string(new.concerns, ', '),
      'persona_case', new.id, new.urgency = 'crisis_review');
  elsif new.urgency = 'crisis_review' and old.urgency is distinct from 'crisis_review' then
    perform public.admin_notify(
      'staff', 'case_urgent', 'Case flagged for urgent review',
      coalesce(new.urgency_reason, 'Possible risk language'),
      'persona_case', new.id, true);
  end if;
  return new;
end;
$$;

drop trigger if exists persona_cases_notify_staff on public.persona_cases;
create trigger persona_cases_notify_staff
  after insert or update of urgency on public.persona_cases
  for each row execute function public.notify_persona_case();

create or replace function public.notify_persona_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.sender_role = 'persona' then
    perform public.admin_notify('staff', 'case_message', 'New message on an anonymous case', null, 'persona_case', new.case_id);
  end if;
  return new;
end;
$$;

drop trigger if exists persona_messages_notify_staff on public.persona_messages;
create trigger persona_messages_notify_staff
  after insert on public.persona_messages
  for each row execute function public.notify_persona_message();

-- ---------------------------------------------------------------------------
-- 2. Dashboard counters
-- ---------------------------------------------------------------------------
create or replace function public.admin_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Africa/Nairobi')::date;
  v jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'bookings_pending',    (select count(*) from public.sessions where status = 'pending'),
    'bookings_today',      (select count(*) from public.sessions where "date" = v_today and status in ('pending', 'confirmed')),
    'bookings_week',       (select count(*) from public.sessions where "date" between v_today and v_today + 6 and status in ('pending', 'confirmed')),
    'bookings_by_day',     (select coalesce(jsonb_agg(jsonb_build_object('date', d::date, 'count', (
                                select count(*) from public.sessions s where s."date" = d::date and s.status in ('pending', 'confirmed'))) order by d), '[]'::jsonb)
                              from generate_series(v_today, v_today + 13, interval '1 day') d),
    'enquiries_new',       (select count(*) from public.enquiries where status = 'new'),
    'cases_open',          (select count(*) from public.persona_cases where status <> 'closed'),
    'cases_awaiting',      (select count(*) from public.persona_cases where status = 'awaiting_review'),
    'cases_unassigned',    (select count(*) from public.persona_cases where status <> 'closed' and assigned_to is null),
    'cases_urgent',        (select count(*) from public.persona_cases where status <> 'closed' and urgency = 'crisis_review'),
    'cases_follow_up_due', (select count(*) from public.persona_cases where status <> 'closed' and follow_up_on <= v_today),
    'articles_published',  (select count(*) from public.blog_posts where status = 'published'),
    'articles_draft',      (select count(*) from public.blog_posts where status is distinct from 'published'),
    'article_views',       (select coalesce(sum(views), 0) from public.blog_posts),
    'notifications_unread',(select count(*) from public.admin_notifications where read_at is null)
  ) into v;
  return v;
end;
$$;

revoke execute on function public.admin_summary() from public, anon;
grant execute on function public.admin_summary() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Team management
-- ---------------------------------------------------------------------------
create or replace function public.admin_staff_directory()
returns table (user_id uuid, email text, roles text[], practitioner_id text)
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
    select u.id, u.email::text, array_agg(ur.role order by ur.role), max(p.id)
      from public.user_roles ur
      join auth.users u on u.id = ur.user_id
      left join public.practitioners p on p.user_id = u.id
     where ur.role in ('admin', 'practitioner')
     group by u.id, u.email
     order by u.email;
end;
$$;

create or replace function public.admin_set_role(p_email text, p_role text, p_grant boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'practitioner') then
    raise exception 'Only the admin and practitioner roles can be managed here' using errcode = '22023';
  end if;

  select id into v_user from auth.users where lower(email) = lower(btrim(p_email)) limit 1;
  if v_user is null then
    raise exception 'No account uses that email. Ask the person to sign up on the website first.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.persona_profiles where user_id = v_user) then
    raise exception 'Anonymous counselling identities cannot be given staff roles' using errcode = '42501';
  end if;

  if p_grant then
    insert into public.user_roles (user_id, role) values (v_user, p_role) on conflict do nothing;
  else
    if v_user = auth.uid() and p_role = 'admin' then
      raise exception 'You cannot remove your own admin access' using errcode = '42501';
    end if;
    delete from public.user_roles where user_id = v_user and role = p_role;
  end if;

  insert into public.audit_events (actor, action, entity, entity_id, metadata)
  values (auth.uid(), case when p_grant then 'role_grant' else 'role_revoke' end, 'user_role', v_user::text, jsonb_build_object('role', p_role));
  return v_user::text;
end;
$$;

create or replace function public.admin_link_practitioner(p_practitioner_id text, p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
  if p_email is not null and btrim(p_email) <> '' then
    select id into v_user from auth.users where lower(email) = lower(btrim(p_email)) limit 1;
    if v_user is null then
      raise exception 'No account uses that email.' using errcode = 'P0002';
    end if;
  end if;
  update public.practitioners set user_id = v_user where id = p_practitioner_id;
  if not found then
    raise exception 'Unknown practitioner' using errcode = 'P0002';
  end if;
  insert into public.audit_events (actor, action, entity, entity_id, metadata)
  values (auth.uid(), 'practitioner_link', 'practitioner', p_practitioner_id, jsonb_build_object('linked', v_user is not null));
end;
$$;

revoke execute on function public.admin_staff_directory() from public, anon;
revoke execute on function public.admin_set_role(text, text, boolean) from public, anon;
revoke execute on function public.admin_link_practitioner(text, text) from public, anon;
grant execute on function public.admin_staff_directory() to authenticated;
grant execute on function public.admin_set_role(text, text, boolean) to authenticated;
grant execute on function public.admin_link_practitioner(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Internal notes (never shown to clients)
-- ---------------------------------------------------------------------------
alter table public.sessions  add column if not exists admin_note text check (admin_note is null or char_length(admin_note) <= 2000);
alter table public.enquiries add column if not exists admin_note text check (admin_note is null or char_length(admin_note) <= 2000);
alter table public.enquiries add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 5. Realtime
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['admin_notifications', 'sessions', 'enquiries', 'persona_cases'] loop
      if not exists (
        select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end;
$$;
