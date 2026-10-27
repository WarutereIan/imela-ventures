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
