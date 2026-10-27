# Imela Ventures — mental wellness platform

React + Vite + TypeScript + Tailwind front end on Supabase (Postgres, Auth, Edge Functions).

> **Before going live, read [`supabase/README.md`](supabase/README.md).** The live database still runs the legacy booking policies, which let any signed-in account read every booking. The fixes are in `supabase/migrations/`, but they have **not** been applied yet.

## Run it locally

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc` on the app |
| `npm test` | Vitest unit and component tests |
| `npm run check` | All of the above |
| `bash scripts/test-db.sh` | Database authorization tests (needs a local PostgreSQL 16) |

A design reference for the character system is available at `/dev/companions` in development builds only.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | — | Public Supabase values. Never put the service-role key in the front end. |
| `VITE_PLATFORM_DB_READY` | `false` | Set to `true` only after applying `supabase/migrations`. Turns on role checks in admin, the practitioner and organisation workspaces, and portal data. |
| `VITE_ENABLE_CLIENT_PORTAL` | `false` | Optional client accounts. Also requires `VITE_PLATFORM_DB_READY=true`. |
| `VITE_PERSONA_AI_ENABLED` | `false` | Optional AI reflections in the "explore privately" guide. Requires the `persona-respond` Edge Function and provider secrets. Each person must also opt in. |
| `VITE_PERSONA_PORTAL_ENABLED` | `false` | Imela anonymous counselling (Persona ID + recovery secret). Requires migration 0007 and the `persona-register` / `persona-account` Edge Functions. Staff pages also need `VITE_PLATFORM_DB_READY=true`. |
| `VITE_PERSONA_LOGIN_DOMAIN` | `persona.imelaventures.invalid` | Synthetic login domain for Persona IDs. Must equal `PERSONA_LOGIN_DOMAIN` in the Edge Functions. |

Edge Function secrets (`RESEND_API_KEY`, `PERSONA_AI_PROVIDER`, `ANTHROPIC_API_KEY`, `PERSONA_AI_MODEL`) are documented in `supabase/README.md`.

## Architecture

```
src/
  data/          Single sources of truth: services (with verification status), concerns,
                 team, resources (starter drafts), organisation facts, crisis contacts
  domain/        Pure, tested logic
    matching.ts      text → concerns → available services, with plain-language reasons
    safety.ts        risk screening that runs before any other step
    persona/         Persona state machine, script (all wording in one place), optional AI client
    booking/         slots, validation, Supabase booking/enquiry API, availability hook
    resources.ts     CMS + starter content, safe text conversion
  components/
    characters/  Companion (original SVG character family) and Scene backdrops
    ui/          Buttons, fields, alerts, chips, stickers
    layout/      Header, footer, urgent-help dialog, quick exit, page states
    persona/ find/ booking/ services/ support/ resources/ organisations/ ...
  pages/         Route components, lazy-loaded from src/router.tsx
supabase/
  migrations/    Roles, RLS hardening, double-booking index, availability RPCs, portal,
                 practitioner and organisation tables (not yet applied)
  functions/     Hardened booking emails; optional provider-agnostic persona-respond
```

### Imela (anonymous counselling)

- `/persona` is the landing page. `/persona/start` gets you a Persona ID, lets you choose concerns and share (optionally), then submits. `/persona/access` is for returning. `/persona/space` holds the private inbox, threads, resources and settings (rotate the secret, delete). `/persona/explore` is the browser-only guided reflection tool.
- `/staff/persona` is the counsellor case queue and audited case view. `/staff/persona/admin` holds workload, triage rules and access history (admins only).
- Identity: each Persona is a Supabase Auth user, created server-side by `persona-register` with a synthetic login. The recovery secret is its password (hashed by Supabase, never visible to staff). The Persona ID alone never grants access.
- Privacy is enforced in the database (`supabase/migrations/20261028000007_persona_portal.sql`): Personas see only their own records, through a narrow view. Internal notes and triage fields are staff-only. Staff changes go through audited functions, and rate limits live in triggers. There are 74 authorization assertions in `supabase/tests/`.
- Sessions are kept in memory (or, optionally, until the tab closes), never in localStorage, and end after 15 minutes of inactivity.
- Before launch:
  - Confirm the safeguarding procedure text on the staff crisis panels.
  - Confirm the counsellor response hours stated to users.
  - Schedule the retention job (`purge_closed_persona_cases`).

### Key design decisions

- **Honest catalogue.** Every service has a status: `available`, `awaiting_verification`, `referral_only` or `unavailable`. Only `available` services can be booked or recommended. Fees are never invented; they show as "Confirmed at consultation".
- **Persona runs in the browser.** The conversation lives in memory only (not in storage, not on the server). The built-in engine needs no AI key. Recommendations always come from the catalogue, never from a language model. Risk screening runs first and pauses the normal flow.
- **Bookings are requests.** The front end inserts a `pending` row with a client-generated id and never reads the bookings table back. Once migration 2 is applied, a partial unique index rejects double bookings in the database. Success is shown only after the insert succeeds.
- **No fake success anywhere.** Enquiries fall back to a pre-filled email from the person's own email app when the `enquiries` table doesn't exist yet. Notification failures are reported honestly.

## Content that needs Imela's review before launch

- Starter resource guides in `src/data/resources.ts`. They are labelled "Draft · awaiting review" on the site.
- Practitioner qualifications and languages (`src/data/team.ts`). They are deliberately left empty. The old site's "PhD / 15 years" claims conflicted with the company profile ("nearly a decade").
- Crisis numbers in `src/data/crisis.ts` (999/112, Kenya Red Cross 1199). Verify them and add any partner helplines.
- Services marked "Being confirmed" in `src/data/services.ts`: premarital counselling, psychological assessment, addiction counselling and specialist trauma therapy.
- The privacy notice and terms. They need review by a qualified data-protection professional (Kenya Data Protection Act 2019).
- Persona wording in `src/domain/persona/script.ts`.
