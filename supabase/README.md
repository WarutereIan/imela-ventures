# Imela Ventures — Supabase backend

This folder contains database migrations and edge functions for the Imela
platform. **None of these have been applied to the live project yet.** They
were written and verified against a local PostgreSQL 16 database (see
"How these were verified" below), but the production project was not
reachable from the development environment.

---

## ⚠️ Urgent security note — read first

The live database follows `docs/booking-flow-setup.md`. Those policies have two
serious problems:

1. **Any signed-in user can read and update every booking.** The policies
   `Authenticated users can read all bookings` and
   `Authenticated users can update bookings` grant this to the `authenticated`
   role, which means *any account*, not just admins. If email sign-ups are
   open in Supabase Auth (they are by default), anyone can create an account
   with the public anon key and read every client's name, email, phone number
   and message.
2. The optional policy `Users can read their own bookings` uses `USING (true)`
   for `public`, which exposes all bookings to **anonymous** visitors if it was
   ever created.

**Do this now, before anything else:**

- Supabase Dashboard → Authentication → Providers → Email → **disable "Allow
  new users to sign up"** until migration `…0002` is applied and an admin role
  has been granted. Existing admin accounts keep working.
- Check what is live:
  ```sql
  select tablename, policyname, roles, cmd, qual
  from pg_policies
  where schemaname = 'public'
  order by tablename, policyname;
  ```
- Then apply the migrations below.

---

## Migrations (apply in order)

| File | What it does |
| --- | --- |
| `20261027000001_roles_and_profiles.sql` | `user_roles` table (admin, practitioner, client, org_admin), `has_role()` / `is_admin()` helpers, `practitioners` directory (seeded with `karen-mwangi`). |
| `20261027000002_harden_sessions.sql` | Replaces the over-broad booking policies with role-based ones; adds nullable columns (`client_user_id`, `practitioner_id`, `starts_at`, `duration_minutes`, `source`, `cancelled_at`); **partial unique index `sessions_active_slot_unique`** to prevent double booking; `session_status_history` audit trail; `availability_slots` (seeded Mon–Fri, 9 AM–5 PM with a 1 PM break, matching the old site) and `availability_exceptions`; PII-free RPCs `get_booked_slots` and `get_closed_dates`; `client_cancel_session`. |
| `20261027000003_blog_posts_rls.sql` | Public can read **published** posts only; admin-only writes; `increment_post_views()` replaces the anonymous UPDATE the old site used; review metadata (`slug`, `reviewed_by`, `reviewed_at`); `settings` becomes admin-only. |
| `20261027000004_persona_and_reflections.sql` | Owner-only `client_reflections`; opt-in, auto-expiring `persona_saved_journeys`; `practitioner_notes` (author + assigned practitioner only — admins have no access by default); `audit_events` + `log_audit()`. |
| `20261027000005_organisations.sql` | `organisations`, `organisation_members`, `corporate_programmes`, `programme_events` (counts only); nullable `sessions.org_id`; `org_utilisation_summary()` with **k = 5 suppression**. Org admins can never read `sessions`. |
| `20261027000006_enquiries.sql` | `enquiries` table for organisation, individual-by-enquiry and general contact requests. Public may insert `status = 'new'` only; admins read/update. |
| `20261028000007_persona_portal.sql` | **Imela Persona anonymous counselling portal** — see "Persona portal" below. |

All migrations are **idempotent and non-destructive**: they only create
objects or add nullable columns, and drop only the four legacy policies named
in `docs/booking-flow-setup.md`. No data is deleted.

### How to apply

**Option A — Supabase CLI**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — SQL editor**: paste each file into Dashboard → SQL Editor and run
them in filename order.

### After applying

1. **Grant yourself admin** (SQL editor):
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com'
   on conflict do nothing;
   ```
2. **Link Karen's practitioner profile to her login** (if she has one):
   ```sql
   update public.practitioners
   set user_id = (select id from auth.users where email = 'karen@example.com')
   where id = 'karen-mwangi';
   ```
3. **Check the double-booking index was created.** If the database already
   contained two active bookings for the same slot, migration `…0002` skips
   the index and raises a WARNING with a query to find the duplicates.
   Resolve them (e.g. cancel one), then re-run `…0002`:
   ```sql
   select indexname from pg_indexes where indexname = 'sessions_active_slot_unique';
   ```
4. **Review any hand-made policies** on `sessions`, `blog_posts` and
   `settings` with the `pg_policies` query above. Permissive policies are
   OR-ed together, so a leftover `using (true)` policy would undo the
   hardening.
5. **Assumption to check:** `blog_posts.id` is assumed to be `uuid` (as the
   front end treats it). If it is a different type, adjust the parameter type
   of `increment_post_views` before applying `…0003`.
6. Re-enable sign-ups only if the client portal is being launched.

### Optional: purge expired saved journeys daily

Enable `pg_cron` (Dashboard → Database → Extensions), then:

```sql
select cron.schedule('purge-persona-journeys', '17 3 * * *',
                     $$select public.purge_expired_persona_journeys()$$);
```

---

## Website contract

| Need | Call |
| --- | --- |
| Create a booking | `insert` into `sessions` with a client-generated `id` (`crypto.randomUUID()`), **no `.select()`** (anonymous users cannot read bookings). A `23505` error means the slot was just taken. |
| Taken slots | `rpc('get_booked_slots', { from_date, to_date })` → rows `{ date, time }` (range ≤ 120 days) |
| Closed days | `rpc('get_closed_dates', { from_date, to_date })` → rows `{ date }` |
| Bookable times | `select weekday, slot_time from availability_slots where active` |
| Enquiry | `insert` into `enquiries` with a client-generated `id`, `status: 'new'`, no `.select()` |
| View counter | `rpc('increment_post_views', { post_id })` |
| Client cancel | `rpc('client_cancel_session', { session_id })` → `true` / `false` |
| Org reporting | `rpc('org_utilisation_summary', { p_org, p_from, p_to })` → `{ month, sessions_count, suppressed }` |
| Role check | `rpc('has_role', { p_role: 'admin' })` |

---

## Edge functions

| Function | Purpose | Who may call |
| --- | --- | --- |
| `send-booking-notification` | E-mails the admin inbox about a new booking. Accepts the legacy body but **trusts only `bookingId`**; reloads the booking with the service role and sends only for a `pending` booking created in the last 10 minutes. The client's free-text message is **not** e-mailed. Subject: "New booking request received". | Public (website) |
| `send-booking-confirmation` | E-mails the client that their booking is confirmed. Requires a signed-in **admin** (checked via `has_role`); only `bookingId` is read; booking must be `confirmed`. Subject: "Your Imela appointment". | Admins |
| `persona-register` | Creates a pseudonymous Persona (ID + recovery secret). See "Persona portal". | Public (no session) |
| `persona-account` | Rotates a Persona's recovery secret or deletes the Persona. | Signed-in Personas only |
| `persona-respond` | Optional AI reflection for Imela Persona. Requires `consent: true`; returns `503 ai_not_configured` if no provider is set. Never logs or stores messages. | Public, only after the person consents |

Every function handles CORS preflight, validates input, escapes all HTML, and
returns an error, never a fake success, when e-mail or AI is not configured.

### Deploy

```bash
supabase functions deploy send-booking-notification --no-verify-jwt
supabase functions deploy send-booking-confirmation
supabase functions deploy persona-respond --no-verify-jwt
supabase functions deploy persona-register --no-verify-jwt   # anonymous callers have no session
supabase functions deploy persona-account                     # JWT verified by Supabase *and* in the function
```

`--no-verify-jwt` is used for the two public functions because anonymous
visitors call them with the anon key. The confirmation function verifies the
caller's JWT itself.

### Secrets

```bash
supabase secrets set RESEND_API_KEY=...            # required for e-mail
supabase secrets set EMAIL_FROM="Imela Ventures <noreply@imelaventures.com>"  # optional; domain must be verified in Resend
supabase secrets set ADMIN_NOTIFICATION_EMAIL=...  # optional fallback if settings.notification_email is empty
supabase secrets set ALLOWED_ORIGIN=https://www.imelaventures.com  # optional; restricts CORS
supabase secrets set PERSONA_AI_PROVIDER=anthropic # optional; leave unset to keep Persona fully on-device
supabase secrets set ANTHROPIC_API_KEY=...         # required if PERSONA_AI_PROVIDER=anthropic
supabase secrets set PERSONA_AI_MODEL=claude-sonnet-5-5  # optional
supabase secrets set PERSONA_LOGIN_DOMAIN=persona.imelaventures.invalid  # required for the Persona portal; must equal VITE_PERSONA_LOGIN_DOMAIN
supabase secrets set PERSONA_MAX_REGISTRATIONS_PER_HOUR=200   # optional global ceiling on new Personas
supabase secrets set PERSONA_REGISTRATIONS_PER_IP_HOUR=5      # optional best-effort per-IP limit
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
provided to edge functions automatically. **Never** put the service-role key
or an AI key in the website's `.env`.

Before enabling `persona-respond`, have the privacy notice reviewed: sending
someone's words to an external AI provider is a cross-border transfer of
sensitive personal data under the Kenya Data Protection Act, 2019.

---

## Persona portal (anonymous counselling)

### How identity works

- A Persona is a **Supabase Auth user created by `persona-register`** with the
  service role. Its login is a synthetic, undeliverable address
  (`imp-xxxx-xxxx-xxxx@PERSONA_LOGIN_DOMAIN`) and its password is the
  **recovery secret** (30 Crockford base32 characters ≈ 150 bits, generated
  server-side with Web Crypto). Supabase stores only a one-way hash, so nobody
  at Imela can see or recover the secret.
- The **Persona ID identifies; only the secret grants access.** Knowing an ID
  alone gives nothing.
- Users are created pre-confirmed, so **no email is ever sent** and public
  sign-ups can stay disabled in the dashboard.
- Losing the secret means losing access — there is deliberately no email or
  phone recovery. A signed-in Persona can rotate the secret
  (`persona-account` → `rotate`, which also signs out every session) or delete
  everything (`delete`, which cascades to cases, messages, notes and resources).
- If Supabase rejects the `.invalid` login domain in your project, set
  `PERSONA_LOGIN_DOMAIN` (and `VITE_PERSONA_LOGIN_DOMAIN`) to a subdomain you
  control that has **no MX record**, e.g. `persona.imelaventures.com`.

### What migration 0007 creates

| Object | Purpose |
| --- | --- |
| `persona_profiles` | Persona ID ↔ auth user. No personal data; `last_active_on` is a date only. |
| `persona_cases` | Concerns, optional story, preferred support, status, urgency, queue, assignee, follow-up date. |
| `persona_my_cases` (view) | What a Persona sees about **its own** cases — no urgency, internal reason, queue or assignee identity. Personas cannot read the base table. |
| `persona_messages` | Append-only thread between the Persona and counsellors. |
| `persona_case_notes` | Internal staff notes. **Never** visible to Personas. |
| `persona_case_resources` | Resources assigned to a case (relative or `https://` links only). |
| `persona_triage_rules` | Transparent concern → queue / base urgency rules. Staff read; admins edit. |
| `persona_risk_screen()` | Risk-language screen (mirrors the website's). A match only **raises** a case to `crisis_review` for prompt human review. |
| Staff RPCs | `staff_open_case` (audits the view), `staff_assign_case`, `staff_set_case_status`, `staff_set_case_urgency` (reason required), `staff_set_follow_up`, `staff_persona_workload` (admins). There is **no** direct UPDATE policy; every change is audited in `audit_events` without copying counselling content. |
| Limits (triggers) | ≤ 3 open cases per Persona; ≤ 5 new cases per 24 h; ≤ 30 Persona messages per hour. Client-supplied status, urgency, queue and assignee are ignored on insert. |
| Access rules | Admins see all cases. Practitioners see the unassigned queue and their own cases, may only self-assign unassigned cases, and may only reply/note on cases assigned to them. A Persona identity can never be granted a staff role. |
| `purge_closed_persona_cases(days)` | Deletes closed cases older than the retention period (min 30, default 365). Not callable from the website. |

Schedule retention (pg_cron):

```sql
select cron.schedule('persona-retention', '15 2 * * *',
       $$select public.purge_closed_persona_cases(365)$$);
```

Inactive Persona logins are removed with the Auth admin API (deleting the
auth user cascades to everything above).

### Supabase settings to check

- **Auth → Rate limits:** keep sign-in limits on — they slow down guessing
  (with ~150-bit secrets guessing is infeasible, but limits also curb load).
- **Auth → JWT expiry:** 3600 s (default) or shorter. The website also signs a
  Persona out after 15 minutes without interaction and never stores the
  session in `localStorage`.
- **Email confirmations** don't apply (admin-created users are confirmed).
  **Public sign-ups can stay disabled.**
- **CORS:** set `ALLOWED_ORIGIN` to the production site.

### Honest privacy limits (tell people)

- Supabase Auth keeps its own audit/request logs, which include **IP
  addresses**, and hosting/CDN providers log requests too. Imela's tables
  never store IPs or device fingerprints, but those infrastructure logs exist;
  check their retention for your Supabase plan and hosting provider.
- Anything a person writes in their story or messages is visible to the
  counsellors handling the case.
- Confidentiality has limits where there is serious risk of harm or a legal
  obligation; describe the escalation process in the privacy notice.

### Testing

`scripts/test-db.sh` builds a throwaway PostgreSQL cluster, applies a stub of
Supabase's `auth` schema (`supabase/tests/00_auth_stub.sql`), applies every
migration **twice**, and runs `supabase/tests/persona_portal_rls.sql`
(74 named assertions covering isolation between Personas, hidden internal
fields, triage, risk escalation, append-only messages, rate limits, staff
scoping, auditing, anonymous access and cascade deletion):

```bash
sudo scripts/test-db.sh        # needs PostgreSQL server binaries; set PGBIN if not in /usr/lib/postgresql/*/bin
```

---

## How these were verified

- All six migrations were applied **twice** (to prove idempotency) to a local
  PostgreSQL 16 database. The database had stub `anon`, `authenticated` and
  `service_role` roles, a stub `auth` schema (`auth.users`, `auth.uid()`
  reading `request.jwt.claim.sub`), the legacy `sessions`, `blog_posts` and
  `settings` tables, and the four legacy policies.
- Behaviour tested by switching roles:
  - anonymous visitors can create a pending booking but cannot read
    bookings, settings or drafts, and cannot insert a `confirmed` booking;
  - a second booking for the same slot fails with `23505` on
    `sessions_active_slot_unique`;
  - `get_booked_slots` returns `{date, time}` only;
  - a random signed-in user sees 0 bookings and cannot grant themselves admin;
  - a client sees only their own booking, cannot link a booking to another
    user, and can cancel their own;
  - an admin sees all bookings, and status changes appear in history;
  - an org admin sees 0 bookings, and `org_utilisation_summary` suppresses
    a month with 3 sessions while showing a month with 6;
  - a random user calling the org summary gets `not authorised`;
  - admins cannot read client reflections;
  - anonymous visitors can insert `new` enquiries only, and cannot read them.
- Migration 0007 (Persona portal) is covered by `scripts/test-db.sh` — 74
  assertions, all passing; two deliberate policy regressions were confirmed
  to make the suite fail.
- **Not verified:** real Supabase Auth/JWT behaviour (including whether the
  synthetic `.invalid` login domain is accepted), Realtime, and the edge
  functions at runtime. The edge functions were typechecked with `tsc` using
  a Deno shim; Deno itself was not available.
