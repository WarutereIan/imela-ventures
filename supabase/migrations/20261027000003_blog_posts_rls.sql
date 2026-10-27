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
