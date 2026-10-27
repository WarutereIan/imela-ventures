-- Minimal stand-in for the parts of Supabase the migrations rely on, so the
-- migrations and RLS tests can run on a plain local PostgreSQL.
-- NOT for production — Supabase provides the real auth schema and roles.

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);

-- Supabase's auth.uid() reads the JWT "sub" claim; tests set it with
-- set_config('request.jwt.claim.sub', '<uuid>', true).
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase grants table privileges to these roles by default and relies on RLS.
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated, service_role;

-- Legacy tables that existed before the migrations (see docs/booking-flow-setup.md).
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(), customer_name text not null, email text not null, phone text not null,
  service text not null, message text, date date not null, time text not null, status text not null default 'pending',
  created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(), title text, category text, status text,
  created_at timestamptz default now(), updated_at timestamptz default now(), views int default 0,
  content text, excerpt text, image_url text, author text);
create table if not exists public.settings (key text primary key, value text);
