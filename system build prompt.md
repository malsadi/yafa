# System Build Prompt — Yafa General Council UK Committee Portal

This is the complete and only brief for building the Committee Portal. It contains every service's full specification, the Administration panel, the technology, the architecture, the rules and the build order. Nothing outside this document is needed. Read all of it before writing any code.

---

# PART 1 — THE BRIEF

## 1. The owner's critical rules

These six rules come from the owner. They override everything else in this document. Breaking any of them means the work is not done.

1. **Never make assumptions.** If something is not stated in this document, stop and ask the owner. Never guess, never fill a gap with a "sensible default", never choose on the owner's behalf. Record every answer in `docs/decisions.md`. This applies to what the portal does, who can do what, money, records, cost and anything irreversible. Purely technical implementation choices within the fixed stack are decided by Claude Code, recorded in `docs/decisions.md` and listed in the phase report (see CLAUDE.md). Questions are batched per phase, never raised one by one.
2. **Never hard-code values.** Roles, role names, unit codes, amounts, thresholds, dates, time windows, lists, categories, formats, limits and texts all come from data. The code contains logic and rules, never configuration.
3. **Never work outside the scope.** Build only what this document describes. No extra features, no "nice to haves", no placeholders for future services.
4. **Pay attention to every detail.** Names, statuses, sub-points, rules and links must match this document exactly. Before finishing any work, check it line by line against the relevant section.
5. **Everything configurable is controlled by the data administrator.** Every configurable value is managed in the Administration panel and read from the database. If a value has not been set, the portal says so and the related action waits; it never falls back to a value written in the code.
6. **Proper file naming and a modular structure.** Every file and folder follows the naming rules in section 5. Code is split into small, single-purpose files organised by service and feature. No long files that mix several jobs.

## 2. How to use this document

1. This document is the single source of truth. If something is not described here, it does not exist.
2. Build one phase at a time (Part 4). At the end of each phase: stop, write a phase report, show test results, list anything uncertain, and wait for approval before the next phase.
3. Each service lists its **Rules**. These are agreed decisions and cannot be changed by settings.
4. Anything marked **Setting** is configured by the data administrator in the Administration panel. Build it as a setting with **no default value** (section 8).
5. Items marked with a **P-number** (for example P7) are proposals written into this brief that the owner has not yet confirmed. They are listed in Part 5. Never build a P-item until the owner has confirmed it and it is recorded in `docs/decisions.md`. If it is rejected or changed, build what the owner said instead.

## 3. What we are building

A private web portal for the officers of Yafa General Council UK and its branches. It is used by committee officers only, never the public. It runs in a browser on desktop and phone, and can be installed on a phone's home screen so officers receive phone notifications. An Administration panel controls how the whole portal is configured and run.

### 3.1 Stage one — build these

| # | Service | Purpose |
|---|---|---|
| 1 | Event organiser | An event from creation to closing, with its own account and task list |
| 2 | Meeting recorder | A committee meeting from set-up to a locked report |
| 3 | Treasury | All of a unit's money |
| 4 | Communication hub | Notices, votes, circulars, conversations and notifications |
| 5 | Calendar | Meetings, events and community dates in one place |
| 6 | Resources library | Templates, guides, venues, equipment and correspondence files |
| 7 | Correspondence and letters | Formal letters in and out, with references and registers |
| 8 | Committee register | Branches, officers, roles, elections and handovers |
| 9 | Task tracker | Everything a branch needs to get done |
| 12 | Achievements and reports | Achievements, history, recognition and the annual report |
| 13 | Documents archive | Permanent home for finished, official records |
| 15 | Administration panel | Configuration, access, permissions and operations for the whole portal |

### 3.2 Out of scope — build nothing for these

- **10. Members register** (community members and households) — later stage.
- **11. Community support, 14, 16. Fundraising and appeals** — not part of this project.
- **Event organiser B5 Volunteers** — shown in the event screen as a disabled item labelled "Coming soon". No data, no routes.
- Member data requests in the Administration panel — later stage.
- Anything listed as "Not included" in a service section.
- Email sending of any kind, other than the sign-in invitations Clerk sends.

Do not add placeholder tables, routes, hooks or folders for anything out of scope.

---

# PART 2 — THE PLATFORM

## 4. Technology stack (fixed — do not substitute)

| Concern | Choice |
|---|---|
| Hosting and compute | Cloudflare Workers. One Worker serves the API and the frontend through Workers Static Assets (single-page-app fallback enabled) |
| Language | TypeScript everywhere, `strict: true` |
| API framework | Hono |
| Database | Cloudflare D1, created with EU jurisdiction (or Western Europe location hint if jurisdiction is unavailable) |
| ORM and migrations | Drizzle ORM; SQL migrations applied with Wrangler |
| File storage | Cloudflare R2, private bucket, EU jurisdiction, never public. A second bucket for backups |
| Authentication | Clerk (sign-in, sessions, multi-factor, account recovery). The only service outside Cloudflare |
| Background work | Cloudflare Queues (notification fan-out, heavy PDF jobs) and Cron Triggers (votes, reminders, backups, housekeeping) |
| PDF generation | Cloudflare Browser Rendering (`@cloudflare/puppeteer`) rendering HTML templates to PDF |
| Direct uploads | R2 presigned URLs (S3-compatible API, signed in the Worker with `aws4fetch`) |
| Cache | Cloudflare KV only if a clear need arises, and only after asking the owner. Never store records in KV |
| Frontend | React + Vite single-page app, React Router, TanStack Query |
| UI styling | Tailwind CSS with a small set of shared components |
| Validation | Zod, schemas shared between API and frontend |
| Phone notifications | Web Push (VAPID) from the Worker to an installable PWA, using a WebCrypto-based implementation |
| Phone calendar | iCalendar (`.ics`) subscription feed served by the Worker |
| Logs and monitoring | Workers Logs with Cloudflare notifications for error spikes. No personal data in logs |
| Code quality | ESLint (including `max-lines`, `max-lines-per-function` and import boundary rules) and Prettier |
| Testing | Vitest with `@cloudflare/vitest-pool-workers`; Playwright for end-to-end journeys |

Rules:

- Nothing runs outside Cloudflare except Clerk.
- Every dependency must run on the Workers runtime (WebCrypto, no `fs`, no native modules). The Node `web-push` package does not work. Check before adding anything, and list every new dependency in the phase report.
- No Cloudflare Pages Functions. One Worker with static assets.
- Accounts needed: Cloudflare Workers Paid plan (for Queues, Browser Rendering and processing time) and a Clerk plan that includes multi-factor authentication.

## 5. File naming and modular structure

### 5.1 Naming rules

| Thing | Rule | Example |
|---|---|---|
| Folders | kebab-case, using the exact service and feature names from this document | `communication-hub/noticeboard-voting/` |
| Worker feature files | `<feature>.<role>.ts`, where role is `routes`, `service`, `repo`, `schema` or `types` | `entries.service.ts` |
| Service-level files | `index.ts` (public interface), `settings.ts`, `events.ts` | `treasury/index.ts` |
| React component files | kebab-case `.tsx`, one component per file; the component itself is PascalCase | `account-detail-page.tsx` exports `AccountDetailPage` |
| React hooks | `use-<name>.ts` | `use-account-balance.ts` |
| Frontend API calls | `<feature>.api.ts` | `entries.api.ts` |
| Tests | Same name as the file tested, with `.test.ts` or `.test.tsx`, in a mirrored path under `tests/` | `tests/api/treasury/entries/entries.service.test.ts` |
| Migrations | `NNNN_<short_description>.sql`, numbered in order | `0007_treasury_immutability_triggers.sql` |
| PDF templates | `<document-name>.html` with `<document-name>.css` if needed | `meeting-report.html` |
| Database tables | snake_case, plural | `event_accounts` |
| Database columns | snake_case | `unit_id`, `created_at` |
| Capabilities | `<service>.<resource>.<action>` | `treasury.debit.approve` |
| Setting keys | `<service>.<setting_name>` | `treasury.approval_threshold` |
| Constants and enums | PascalCase type names; values are the exact labels in this document | `TaskStatus.InProgress = 'In progress'` |

Forbidden file names: `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`, `stuff.ts`, `temp.ts`, or any name that does not say what the file does. Name files by their job, for example `format-money.ts`, `parse-reference-number.ts`.

### 5.2 Size and responsibility limits

- One file, one responsibility.
- Source files stay under 250 lines. ESLint fails the build above 300 lines.
- Functions stay under 50 lines. React components stay under 150 lines.
- Tests may reach 400 lines per file.
- Generated files (Drizzle migration snapshots) are excluded from the limits.
- When a file approaches a limit, split it by responsibility into a sub-folder. Never raise the limit and never disable the lint rule.

### 5.3 Module boundaries

- Each service has one `index.ts`. It is the only file other services may import from. ESLint import boundary rules enforce this.
- Inside a service, each feature (for example `entries`, `approvals`, `statements`) is its own folder containing its routes, service, repo and schema files.
- `routes` files handle HTTP only. `service` files hold business rules. `repo` files hold database access. Routes never import repos directly.
- `core/` modules are shared by all services and never import from a service.
- Shared Zod schemas and status enums live in `src/shared/`, split into one file per service.

### 5.4 Repository layout

```
/
├── CLAUDE.md
├── system build prompt.md
├── docs/
│   ├── decisions.md              # Every owner answer and confirmed P-item
│   ├── permissions.md            # The capability catalogue (names and meanings, no role assignments)
│   ├── operations.md             # Deploy, restore, secrets, first officers (Phase 12)
│   └── phase-reports/
│       └── phase-00.md
├── seed/                         # Launch data supplied by the owner only (section 8.3)
├── wrangler.jsonc
├── drizzle.config.ts
├── eslint.config.js
├── migrations/
├── src/
│   ├── worker/
│   │   ├── index.ts              # Hono app assembly only
│   │   ├── cron/                 # one file per scheduled job
│   │   ├── queues/               # one file per queue consumer
│   │   ├── middleware/           # one file per middleware
│   │   ├── core/
│   │   │   ├── permissions/
│   │   │   ├── settings/
│   │   │   ├── service-switches/
│   │   │   ├── audit/
│   │   │   ├── notifications/
│   │   │   ├── files/
│   │   │   ├── pdf/
│   │   │   ├── push/
│   │   │   ├── events-bus/
│   │   │   ├── ids/
│   │   │   ├── dates/
│   │   │   ├── money/
│   │   │   └── errors/
│   │   └── services/
│   │       └── treasury/         # example; every service follows this shape
│   │           ├── index.ts
│   │           ├── settings.ts
│   │           ├── events.ts
│   │           ├── accounts/
│   │           │   ├── accounts.routes.ts
│   │           │   ├── accounts.service.ts
│   │           │   ├── accounts.repo.ts
│   │           │   └── accounts.schema.ts
│   │           ├── entries/
│   │           ├── approvals/
│   │           ├── corrections/
│   │           ├── statements/
│   │           └── year-end-close/
│   ├── db/schema/                # one folder per service, one file per table group
│   ├── shared/                   # one folder per service plus core
│   ├── pdf-templates/            # one file per document
│   └── web/
│       ├── app/                  # routing, layouts (portal and admin), auth shell
│       ├── components/           # shared UI, one component per file
│       ├── text/                 # every user-facing text string, one file per service
│       ├── features/
│       │   └── treasury/         # example
│       │       ├── accounts/
│       │       │   ├── accounts-list-page.tsx
│       │       │   ├── account-detail-page.tsx
│       │       │   ├── account-form.tsx
│       │       │   ├── use-accounts.ts
│       │       │   └── accounts.api.ts
│       │       └── entries/
│       └── pwa/
└── tests/
    ├── api/                      # mirrors src/worker/services
    ├── permissions/
    ├── integrity/
    └── e2e/
```

## 6. Identity and authentication

### 6.1 Who answers what

- **Clerk answers "who is this person?"**: sign-in, passwords, multi-factor, sessions, recovery.
- **D1 answers "what may they do?"**: every role, unit and power comes from the Committee register and the permissions matrix in D1. Nothing about roles or units is stored in Clerk metadata.

### 6.2 Invitations and linking

- Public sign-up is closed. A register officer adds an officer in the Committee register; this sends a Clerk invitation to their email.
- When the invitation is accepted, a Clerk webhook links the Clerk user to the person record by email. Webhooks are verified by signature (Svix); anything unsigned is rejected.
- Email changes in Clerk are synced by webhook. A deleted Clerk user leaves the person record in place, unlinked.
- A signed-in user with no linked person holding a current term sees only the "access not active" page (text from 15 C5).
- When a person's last current term ends, their powers end immediately. Their record stays. **Setting:** whether their Clerk account is locked automatically.

### 6.3 Every request

- Middleware verifies the Clerk session token (sent in the `Authorization` header, not a cookie), loads the person's current terms and the permissions matrix, and builds the request context: `{ personId, units, roles, capabilities, isSystemAdmin }`.
- Nothing about permissions is cached between requests.
- **Setting:** which roles must use multi-factor authentication. System administrators always must.

### 6.4 Phone calendar access

The calendar feed cannot use Clerk. Each officer has a long random feed token, stored hashed. The feed URL contains it. Officers can regenerate it (revoking the old one); administrators can revoke any token. The feed returns only what that officer may see.

## 7. Permissions

This is the highest-risk part of the system. One missed check exposes one branch's data to another.

### 7.1 Units

- **Branch**: name, code, area, status (active or inactive). All values entered by the data administrator.
- **General Council**: a unit of type `national`. Its name and code are entered by the data administrator. It holds the General Council officers and owns national content (circulars, national resources, national templates, national archive documents). It is not listed as a branch in branch pickers. Whether it also runs its own events, meetings, treasury, tasks, letters and achievements is **P1**.

### 7.2 Capabilities, not role names

- Code never checks role names. It checks capabilities: `can(ctx, 'treasury.debit.create', { unitId })`.
- Claude Code writes the **capability catalogue**: every capability the portal uses, with its meaning and allowed scopes, in `src/worker/core/permissions/capability-catalogue.ts` and documented in `docs/permissions.md`.
- The **permissions matrix** (which role holds which capability, at which scope) is data. It starts empty. The data administrator fills it in the Administration panel (15 A3). Claude Code never assigns capabilities to roles.
- Scopes: **own unit**, **all units**, **national content**.
- Roles with a special meaning in the fixed rules (the branch register officer role and the national register officer role) are **designated** by the data administrator in 15 B2. The code refers to the designation, never to a role name.

### 7.3 Fixed rules (from the service specifications; hard-coded as logic, shown locked in the matrix editor, never editable)

| Area | Rule |
|---|---|
| Committee register | A branch register officer manages their own branch only. The national register officer manages all branches, and alone adds or changes branches and maintains the standard roles |
| Correspondence | Letters in and out are visible to their own branch only |
| Letter templates | National templates visible to all branches; branch templates to that branch only |
| Resources library | General Council resources shared with all branches; branch resources to that branch only |
| Documents archive | General Council documents visible to all branches; branch documents visible to that branch and to the General Council |
| Achievements | The General Council sees achievements from all branches |
| Treasury approval | A debit above the threshold is approved by a second officer, never the one who entered it |
| National circulars | Sent by the General Council only; always notify; cannot be switched off |
| Topic discussions | Visible to invited officers only |
| Role networks | Visible to officers currently holding that role only |
| Noticeboard votes | One vote per person; only eligible voters vote |

Proposed additional fixed rules: administrators gain no access to content through the administrator role (**P22**); at least two system administrators always exist (**P21**).

### 7.4 Enforcement in three layers

1. **Routes**: every route declares its capability. A route without one fails a test.
2. **Repositories**: every query on unit-owned data filters by the scope in the context. No "get by id" skips the unit filter.
3. **Permission sweep** (`tests/permissions/`): for every route, sign in as an officer of Branch A and try to read and write Branch B's records; as a branch officer try national actions; as an administrator try to read content. Every attempt must fail with 403 or 404. The sweep builds its own test matrix inside the test, runs on every commit and is never skipped.

Return 404 instead of 403 wherever revealing existence would leak information.

## 8. Settings, lists and seed data

### 8.1 Settings registry

- `core/settings` holds the **settings registry**. Every service registers its settings in its `settings.ts`: key, label, description, Zod schema, whether it is required before the service can be used, and whether a unit override is allowed.
- **No setting has a default value in code.** Values are entered by the data administrator.
- Values are stored in D1 at national level, with per-unit overrides where allowed. Services read settings only through `getSetting(ctx, key, unitId)`, which resolves unit override → national value. If neither exists, it returns "not configured".
- When a required setting is "not configured", the related action is refused with a clear message ("This has not been set up yet. Please ask your administrator.") and the screen shows the same. Nothing falls back to a coded value.
- A service cannot be switched on for a unit until all its required settings are set (15 C6).
- Every change is recorded with who, when, before and after. Any earlier value can be restored.
- No setting can override a Rule or a fixed permission.

### 8.2 Lists

Event types, meeting types, achievement categories, equipment conditions and default handover checklist items are **lists** managed by the data administrator (15 B3). They start empty. The Documents archive categories are the exception: the six categories are fixed by the specification, stored as locked data created by a migration, and shown read-only.

### 8.3 Seed data

- Launch data comes only from files the owner supplies in `seed/`: the General Council unit, the first system administrators, the national register officer, standard roles, branches, officers and opening balances.
- Claude Code never invents seed values. If a seed file is missing or incomplete, stop and ask.
- Tests use clearly fictional data created inside the tests themselves, never shared with seed files.

### 8.4 Service switches

- Each service can be switched on or off portal-wide or for a unit. Switching off hides it and blocks its routes; it never deletes data.
- The switch refuses combinations that break dependencies (for example, Treasury cannot be off while the Event organiser is on).
- The Committee register, Documents archive and Administration panel cannot be switched off.

### 8.5 Languages and texts

The portal works fully in **English and Arabic** from launch (owner decision).

- Each officer chooses their own language; it is saved on their person record and used on every device. **Setting:** the language new officers start with.
- In Arabic the whole interface is right-to-left: layout, navigation, tables, forms, icons that point a direction, and the admin area. In English it is left-to-right. Direction is set on the `<html>` element from the officer's language.
- Every user-facing text lives in `src/web/text/`, with one folder per language (`en/`, `ar/`) and one file per service inside each. Never written inline in components. A test fails if a text key exists in one language and not the other.
- Arabic texts are drafted by Claude Code and marked "awaiting owner review" in the phase report until the owner approves them.
- Texts the data administrator edits (privacy notice, access-not-active message, help text, iPhone install guide) are stored in both languages in the database (15 C4, C5).
- What officers type (names, notices, minutes, letters) is stored exactly as typed, in either language, and displayed with the correct direction for its own content.
- Dates and numbers are formatted with the browser's `Intl` API for the officer's language. **Setting:** whether Arabic screens show Western digits (0-9) or Arabic-Indic digits (٠-٩). Money is always GBP.
- Fonts that support Arabic and Latin script are served from the portal's own static assets, never from outside services. The font choice comes from branding (15 C3).
- Search works for Arabic text as well as English.
- Clerk's sign-in screens use Clerk's Arabic localisation when the language is Arabic. Before sign-in, when the officer's choice is not yet known, the browser's language decides.

## 9. Data conventions

### 9.1 D1

- One database. IDs are ULIDs as text. Timestamps are ISO 8601 UTC text, displayed in Europe/London.
- Money is integer pence, GBP only. Never floats.
- Every table holding unit data has `unit_id`, indexed.
- Status values use the exact names in this document, as enums in `src/shared`. Statuses are rules, not configuration.
- Editable records carry a `version` number. Saves send the version they read; a stale save is rejected with a clear "someone else changed this" message.
- Migrations are append-only.
- **Batches**: D1 `batch()` is atomic but has no interactive transactions. Any logic that depends on current data inside a batch (balances, next reference number, closing balance transfer) is done in SQL (`INSERT … SELECT`, `UPDATE … RETURNING`, conditional `WHERE` clauses), never read-then-write in TypeScript.
- **Immutability triggers**: SQLite triggers block `UPDATE` and `DELETE` on Treasury entries, entries in closed financial years, closed events and their files, logged meeting reports, finalised annual reports, archive records, the audit log and settings history. The application checks first; the trigger guarantees it.

### 9.2 Audit log

One append-only `audit_log` table: who, what action, which record, when, before and after where useful. It feeds task histories, the Administration audit viewer and Treasury traceability.

### 9.3 Files in R2

- Object keys: `{unitCode}/{service}/{recordId}/{fileId}-{safeName}`.
- A `files` table records every object: key, owner unit, service, record, uploader, size, type, checksum, created time, locked flag.
- **Uploads**: the Worker checks permission, then issues a short-lived presigned URL; the browser uploads directly to R2 (multipart for large files); the browser then calls a "complete" endpoint, where the Worker checks the object exists, its size and type, and records it. The bucket's CORS allows only the portal's own origin.
- **Downloads**: the Worker checks permission, then streams small files or issues a short-lived presigned download link for large ones. **Setting:** the size above which a presigned link is used, and how long the link lasts.
- **Setting:** allowed file types and size limits for each use (receipt photos, documents, letter scans, media images, video).
- **Setting:** maximum image dimension. Photos taken on a phone are converted to JPEG and resized to this on the device before upload.
- Files of locked records can never be deleted or overwritten.
- **R2 and D1 are not atomic together.** The order is always: write the object to R2, then commit the D1 batch that records it. A nightly job removes R2 objects with no `files` record older than the **Setting:** orphan age.

### 9.4 PDFs

- `core/pdf` renders HTML templates from `src/pdf-templates/` through Browser Rendering and returns a PDF.
- Templates: letter on letterhead, meeting report, Treasury statement, post-event report, annual report. One shared stylesheet.
- Letterhead design, logo, fonts and colours come from the Administration panel (15 C3).
- Every PDF can be produced in English or Arabic, with the correct direction and fonts. A generated PDF uses the language of the officer producing it, except letters, which use the language of their template.
- Letters and statements are generated during the request. Annual reports and post-event reports are generated through a Queue job if they take too long, with the screen showing progress.
- Every filed PDF is a locked file.

### 9.5 Notifications (core)

- `core/notifications` holds the in-portal notification inbox for every officer and the Web Push sender.
- Both the Communication hub and the Task tracker use it. The Task tracker writes in-portal reminders only, never push, and never touches the Communication hub.
- Push fan-out goes through a Queue; failed pushes retry (**Setting:** number of retries); expired subscriptions are removed.

## 10. How services connect

Services talk through `core/events-bus`. Where the reaction must be consistent with the trigger, it runs in the **same D1 batch**. Notifications go through a **Queue**.

### 10.1 Integration contract — build exactly these

| Trigger | Effect | How |
|---|---|---|
| Event created (1 A1) | Event account created in Treasury with budget lines (3 A2); task list created; template defaults applied (1 A3) | Same batch |
| Event task added or changed (1 B1) | It is the same record shown in the Task tracker, marked with its event (9 A1) | One shared table |
| Event published (1 B4) | Event shown read-only in the Calendar (5 A2); automatic Noticeboard post (4 A1) | Same batch; push via Queue |
| Event closed (1 C2) | Post-event report PDF written to R2; then in one batch: balance transferred to a branch account (3 B3), event account closed, event files and report filed to the archive (13 A1), event locked | R2 first, then one batch |
| Meeting details saved (2 A1) | Meeting shown read-only in the Calendar (5 A1); automatic Noticeboard post "meeting scheduled" (4 A1) | Same batch; push via Queue |
| Meeting report logged (2 C1) | Report PDF written to R2; then report locked, filed to the archive, automatic Noticeboard post "meeting has taken place" | R2 first, then one batch |
| Treasury statement filed (3 C2) | Filed to the archive (13 A1) | R2 first, then one batch |
| Financial year closed (3 C3) | Year's entries locked | Same batch |
| Letter generated (7 A2) | Reference number (7 B1), Letters out register entry (7 B2), PDF in Library Letters out (6 D2) | R2 first, then one batch |
| Letter received (7 B3) | Reference number, Letters in register entry, scan in Library Letters in (6 D3) | R2 first, then one batch |
| Annual report finalised (12 B2) | Content frozen and locked, PDF filed to the archive (13 A1) | R2 first, then one batch |
| Election confirmed (8 C1) | Outgoing officers become past officers, incoming officers start; role network membership follows automatically (4 B1) | Same batch |
| New notice, vote, vote result, circular, reply or request (4) | In-portal notification and push, respecting each officer's choices; circulars always notify (4 C2) | Queue |

### 10.2 Must NOT be connected (each has a test)

- The Calendar, Correspondence, Task tracker, and Achievements and reports have no interaction with the Communication hub.
- The Meeting recorder sends only its two messages to the hub, and sends no actions to the Task tracker.
- Task reminders are in-portal only, never phone push.
- Equipment loans have no automatic link to any other service.
- Noticeboard votes are separate from formal meeting votes.
- Automatic Noticeboard posts come only from the Event organiser and the Meeting recorder.

### 10.3 Read-only mirrors

Meetings and events in the Calendar, and the event link on event tasks, are never edited from the mirror. The Calendar shows them with a link to the owning service; its API rejects edits to them.

## 11. Scheduled work

Each job is its own file in `src/worker/cron/`. How often each job runs is set in `wrangler.jsonc` (Cron Triggers cannot be changed at runtime); the time windows the jobs use are settings.

| Job | What it does |
|---|---|
| Close votes | Closes votes past their closing date; queues result notifications |
| Task reminders | In-portal reminders before the due date and when a task becomes overdue |
| Backup | Exports D1 to the backup bucket; removes backups older than the **Setting:** backup retention |
| Orphan clean-up | Removes R2 objects with no `files` record |
| Push pruning | Removes expired push subscriptions |
| Every job | Records last-run time and outcome for the health screen (15 D1) |

The schedule for each job is agreed with the owner in Phase 0.

## 12. Security

- Security headers on every response: strict Content Security Policy (own origin plus Clerk's domains only), HSTS, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict referrer policy.
- API accepts requests only from the portal's origin (CORS). Session token in the `Authorization` header, not cookies.
- Cloudflare rate limiting rules on sign-in-adjacent routes, uploads, the calendar feed and webhooks. The limits are agreed with the owner in Phase 12.
- All secrets (Clerk keys, webhook secret, VAPID keys, R2 S3 credentials, Cloudflare API token for backups) stored with `wrangler secret`, never in the repository.
- **Maintenance mode** (15 D6) puts the whole portal into read-only with a banner.

## 13. Data protection (UK GDPR)

- The portal holds officers' personal data (names, contact details, history). Past officers are kept permanently and the archive is never deleted. The lawful basis is **P23**.
- The privacy notice text is entered by the data administrator (15 C5) and shown to every officer on first sign-in and from the footer.
- D1 and R2 are held in the EU. Clerk stores identity data in the United States; this must be stated in the privacy notice.
- No personal data in logs. Contact details are shown only to officers who may read the register.

---

# PART 3 — THE SERVICES

Each service lists its sub-points, record statuses, links, Rules, Settings, proposals awaiting confirmation, and build notes.

---

## 14. Service 8 — Committee register

**Purpose.** The official record of every branch and the officers who serve in it. Each branch has a register officer who manages that branch's register, and the General Council appoints a national register officer who can do the same across all branches. Roles come from a standard national list, so the same role means the same thing in every branch. Elections update the officers list once confirmed, handovers pass responsibilities from outgoing to incoming officers, and past officers are kept as each branch's history.

### Stage A — Branches and register officers

| # | Sub-point | Covers |
|---|---|---|
| A1 | Branches | Each branch's name, branch code, area and status (active or inactive). The branch code is also used in letter reference numbers |
| A2 | Branch register officer | One officer in each branch who manages that branch's register: officers, terms, elections, handovers and past officers |
| A3 | National register officer | An officer appointed by the General Council who can do everything a branch register officer does, for every branch, and also adds branches and maintains the standard roles |

### Stage B — Current committee

| # | Sub-point | Covers |
|---|---|---|
| B1 | Officers and roles | Name, role, branch, contact details and start date for each current officer, including General Council officers |
| B2 | Standard roles | A national list of roles used by every branch; branches can add extra roles of their own |
| B3 | Terms of office | Start and end date for each officer, with terms ending soon highlighted in the register |

### Stage C — Changes of officers

| # | Sub-point | Covers |
|---|---|---|
| C1 | Elections | Date, positions, candidates and results. Once confirmed, the officers list updates |
| C2 | Handovers | A checklist of what passes from the outgoing to the incoming officer, such as documents, account access and equipment, confirmed by both |
| C3 | Past officers | Officers whose term has ended, with their role and dates, kept as the branch's history |

### Who does what

| Task | Branch register officer | National register officer |
|---|---|---|
| Add or change branches | No | Yes |
| Maintain standard roles | No | Yes |
| Add extra branch roles | Own branch | All branches |
| Officers, terms, elections, handovers, past officers | Own branch | All branches |

**Officer status:** Current → Past officer

**Links:** officers list used by the Meeting recorder to select attendees; roles used by the Communication hub to build role networks; signing officer's name and role, and the branch code, used by Correspondence and letters.

**Rules**
- The register covers branches as well as officers.
- Each branch has one register officer who manages its own branch's register.
- The General Council appoints a national register officer with the same powers across all branches, who alone adds branches and maintains the standard roles.
- Roles come from a standard national list; branches may add extra roles of their own.
- Election results update the officers list only once confirmed.
- Officers whose term has ended are kept as past officers, never deleted.

**Settings:** terms ending soon window; lock Clerk account when the last term ends; roles requiring multi-factor authentication.

**Proposals awaiting confirmation:** P1, P3, P4, P5, P21, P22.

**Build notes**
- Tables: `units`, `people` (a person, with contact details and optional `clerk_user_id`), `terms` (person, role, unit, start, end, status), `roles` (standard or branch extra), `elections`, `election_positions`, `election_candidates`, `handovers`, `handover_items`.
- A person can hold several terms at once, in different units or roles.
- Confirmation of an election ends outgoing terms and starts incoming terms in one batch. Who may confirm is set in the permissions matrix.
- Handover checklists start from the handover items list (15 B3); each confirmation records who and when.

---

## 15. Service 13 — Documents archive

**Purpose.** The permanent home for finished, official records. Records from other services are filed automatically when they are finished and stay read-only, since they were already locked in their own service. Officers can also upload other official documents directly, such as the constitution, policies, insurance certificates and signed agreements. Everything sits in named categories and can be searched and downloaded. Nothing in the archive is ever deleted.

### Stage A — Filing

| # | Sub-point | Covers |
|---|---|---|
| A1 | Automatic filing | Closed events, logged meeting reports, Treasury statements and finalised annual reports, filed automatically and read-only |
| A2 | Upload | Officers upload other official documents, such as the constitution, policies, insurance certificates and signed agreements |
| A3 | Categories | Events, Meetings, Finance, Annual reports, Governance and General. Automatic filings go straight into their category |
| A4 | Versions | Uploading a new version of a document keeps all earlier versions; automatic filings have no versions, as they are locked |
| A5 | National and branch archive | General Council documents are visible to all branches; each branch's documents are visible to that branch, and the General Council can see every branch |

### Stage B — Finding

| # | Sub-point | Covers |
|---|---|---|
| B1 | Search | By title, category, branch or date |
| B2 | Download | Any document the officer is allowed to see |

### Archive or Resources library

| Documents archive | Resources library |
|---|---|
| Finished, official records | Working and reference material |
| Closed events, meeting reports, statements, annual reports, governance documents | Templates, guides, venues, equipment, correspondence |
| Read-only or versioned; never deleted | Updated freely as material changes |

**Links:** Event organiser (event documents and media filed when the event closes); Meeting recorder (logged meeting reports); Treasury (statements); Achievements and reports (finalised annual reports).

**Rules**
- The archive holds finished, official records only; working material stays in the Resources library.
- Correspondence is stored in the Resources library, not the archive.
- Automatic filings are read-only; uploaded documents keep every version.
- Nothing in the archive is ever deleted. No delete endpoint exists.
- General Council documents are shared with all branches; branch documents are visible to their own branch and the General Council.

**Proposals awaiting confirmation:** P2.

**Build notes**
- Automatic filings are created only through the exported `fileRecord()` function in `documents-archive/index.ts`, called inside the calling service's batch. Officers cannot create them manually.
- A new version adds a version row and a new R2 object; earlier objects are kept.
- Search uses indexed D1 queries; SQLite FTS5 on title and description if needed.

---

## 16. Service 6 — Resources library

**Purpose.** The branch's shared store of useful material: templates, guides, venues, equipment and correspondence. The General Council adds resources for every branch, and each branch can add its own. Officers can find the right form or guide, look up a venue used before, check what equipment the branch owns, and find any letter template or any letter sent or received, each in its own named section.

### Stage A — Templates and guides

| # | Sub-point | Covers |
|---|---|---|
| A1 | Templates | Forms, sign-in sheets, flyer and poster designs, and other ready-to-use files (not event templates, and not letter templates, which have their own section in D1) |
| A2 | Guides | Role handbooks, procedures and how-to guides for officers |
| A3 | National and branch resources | General Council resources are shared with all branches; each branch can also add its own |

### Stage B — Venues

| # | Sub-point | Covers |
|---|---|---|
| B1 | Venue directory | Name, address, capacity, facilities, contact person, typical cost, and notes from past use |

### Stage C — Equipment

| # | Sub-point | Covers |
|---|---|---|
| C1 | Equipment register | Item, quantity, where it is kept and its condition |
| C2 | Equipment loans | Who has borrowed an item, when, and when it is due back |

### Stage D — Correspondence

| # | Sub-point | Covers |
|---|---|---|
| D1 | Letter templates | Standard letters used by Correspondence and letters. National templates for all branches, plus each branch's own |
| D2 | Letters out | PDF copy of every letter sent, filed automatically under its reference number |
| D3 | Letters in | Scan or photo of every letter received, filed automatically under its reference number |

**Sections:** Templates (A1), Guides (A2), Venues (B1), Equipment (C1, C2), Correspondence (D1, D2, D3).

**Links:** Correspondence and letters uses letter templates from D1 and files letters out and in to D2 and D3.

**Rules**
- Venues and equipment are reference information only; booking is not included.
- Event templates stay in the Event organiser.
- All correspondence is stored in the library under its own Correspondence section: letter templates, letters out and letters in.
- Letter templates can be national or branch; letters in and letters out are visible to the branch only.
- General Council resources are shared with all branches; branches can add their own.
- Equipment loans are recorded in the library only, with no automatic link to other services.

**Settings:** equipment conditions come from the list in 15 B3.

**Proposals awaiting confirmation:** P19, P20.

**Build notes**
- Templates and guides are files plus metadata; they may be replaced freely.
- D2 and D3 are written only by the Correspondence service. The library shows them read-only.

---

## 17. Service 3 — Treasury

**Purpose.** Records all of a branch's money. Each branch has its main account, and event accounts are created automatically by the Event organiser and sit alongside it. All money is recorded as a credit, a debit or a transfer between accounts, each with its receipt photo attached. Balances update as each entry is saved, and statements can be produced for any account over any period.

### Stage A — Accounts

| # | Sub-point | Covers |
|---|---|---|
| A1 | Branch accounts | The branch's main account, opened by the treasurer, for example bank or cash |
| A2 | Event accounts | Created automatically from the Event organiser, with budget lines. Closed when the event closes, with the balance returned to the branch account |

### Stage B — Transactions

| # | Sub-point | Covers |
|---|---|---|
| B1 | Credits | Money in: amount, date, account, source and description |
| B2 | Debits | Money out: amount, date, account, paid to and description |
| B3 | Transfers | Money moved between accounts, including event closing balances |
| B4 | Receipt photos | Attached to each credit or debit |
| B5 | Payment approval | Debits above a set amount need a second officer to approve |
| B6 | Corrections | Entries are never deleted; a mistake is corrected with a reversing entry, so the history stays complete |

### Stage C — Balances and statements

| # | Sub-point | Covers |
|---|---|---|
| C1 | Balances | Live balance per account, plus a branch total |
| C2 | Statements | Per account, for any period |
| C3 | Year-end close | The treasurer closes the financial year and locks its entries |

**Account status:** Open → Closed

**Links:** Event organiser (event accounts created automatically; closing balance returned to the branch account); Documents archive (statements filed).

**Rules**
- Accounts are split into branch accounts and event accounts.
- Event accounts are created and closed through the Event organiser only; the Treasury API refuses to do either directly.
- Debits above a set amount require a second officer's approval; the entering officer can never approve their own.
- Entries are never deleted; corrections are made by reversing entries.
- Each financial year is closed and locked by the treasurer.
- Balances are always derived from entries. A cached balance is allowed only if updated in the same batch and verified by a test.
- A transfer is one record that debits one account and credits another atomically.

**Settings:** approval threshold (unit override allowed); financial year start (unit override allowed); whether a receipt is required when a credit or debit is saved.

**Proposals awaiting confirmation:** P6, P7, P8, P9, P10.

**Build notes**
- Provide an exported `yearEndSummary(unitId, year)` in `treasury/index.ts` for the annual report.
- Integrity tests: balance equals the sum of entries that count towards it; no path edits or deletes an entry; self-approval fails; closed-year entries cannot be changed; event close leaves the event account at zero and the receiving account higher by exactly that amount; concurrent entries never corrupt balances.

---

## 18. Service 9 — Task tracker

**Purpose.** Holds everything a branch needs to get done. Tasks come from two places: event tasks, created in the Event organiser and shown here automatically, marked with their event; and branch tasks, created directly in the tracker. Each task is a single record, so an update made in the event or in the tracker shows in both. Every officer sees their own tasks, and the branch sees its full action list. Tasks are fully flexible, and the tracker informs but never blocks.

### Stage A — Tasks

| # | Sub-point | Covers |
|---|---|---|
| A1 | Create task | Title, description and branch. Event tasks arrive automatically from the Event organiser, marked with their event |
| A2 | Assign owner | Chosen from the officers list, and can be reassigned at any time |
| A3 | Due date | Set when the task is created, and can be changed at any time |
| A4 | Status | To do, In progress, Done or Cancelled |

### Stage B — Following up

| # | Sub-point | Covers |
|---|---|---|
| B1 | My tasks | Each officer's own tasks in one list, with due soon and overdue highlighted |
| B2 | Branch action list | All the branch's tasks, filtered by owner, status or event |
| B3 | Reminders | A reminder inside the portal before the due date and when a task becomes overdue |
| B4 | Task history | Log of who created, changed or completed each task |

**Task status:** To do → In progress → Done (or Cancelled)

**Links:** Event organiser (event tasks are the same record; updates show in both places); Committee register (owners chosen from the officers list).

**Rules**
- Event tasks and branch tasks sit in one tracker; an event task is a single record shared with the Event organiser.
- Tasks are fully flexible: owners, due dates and details can be changed at any time; nothing is blocked (except tasks of a closed, locked event).
- Reminders are shown inside the portal only; the Task tracker has no interaction with the Communication hub.
- The Meeting recorder does not send actions to the Task tracker.

**Settings:** due soon window; how long before the due date the reminder is sent.

---

## 19. Service 5 — Calendar

**Purpose.** Brings together meetings, events and community dates in one place. Meetings and events appear automatically from their own services and can only be changed there, so the calendar never goes out of step. Community dates are added directly by officers. Each branch sees its own calendar by default and can switch to see all branches together, and officers can link the calendar to their phone.

### Stage A — What appears

| # | Sub-point | Covers |
|---|---|---|
| A1 | Meetings | Added automatically from the Meeting recorder when scheduled; read-only in the calendar |
| A2 | Events | Added automatically when published from the Event organiser; read-only in the calendar |
| A3 | Community dates | Added directly by officers, either for one branch or for all branches |

### Stage B — Views

| # | Sub-point | Covers |
|---|---|---|
| B1 | Branch view | The branch's own meetings, events and community dates, shown by month, week or list |
| B2 | All-branches view | Every branch's dates together, with each branch shown in its own colour |
| B3 | Filters | Show or hide meetings, events or community dates, and choose which branches to include |
| B4 | Date clash notice | When a date is chosen that already has another meeting or event, a notice is shown, but nothing is blocked |

### Stage C — Phone

| # | Sub-point | Covers |
|---|---|---|
| C1 | Phone calendar link | Officers subscribe once, and the portal's dates then appear in their phone calendar and stay updated |

**Links:** Event organiser (events added when published); Meeting recorder (meetings added when scheduled).

**Rules**
- Meetings and events appear automatically and are read-only in the calendar; they are changed only in their own services.
- Community dates are the only items entered directly in the calendar.
- Each branch sees its own calendar by default, with an all-branches view available.
- Date clashes are shown as a notice only; nothing is blocked.
- The Calendar has no interaction with the Communication hub.

**Settings:** whether the phone feed includes all-branches community dates; each branch's colour (set on the unit in 15 B1).

**Build notes**
- The Calendar stores community dates only. Meetings and events come from a read-model table written by the owning service in its own batch; the owning service is the only writer.
- Export `checkClashes(unitId, date)` in `calendar/index.ts` for the Event organiser and Meeting recorder; it returns notices, never errors.

---

## 20. Service 4 — Communication hub

**Purpose.** How officers and branches talk to each other. Announcements are one-way: branch notices on the Noticeboard, including automatic posts from events and meetings and notices put to a vote, and national circulars sent from the General Council to branches. Conversations are two-way: role networks, topic discussions and requests between branches. Notifications let people know when something new needs their attention.

### Stage A — Announcements

| # | Sub-point | Covers |
|---|---|---|
| A1 | Noticeboard | Branch notices posted by officers, plus automatic posts from the Event organiser (event published) and Meeting recorder (meeting scheduled, meeting has taken place), marked as automatic |
| A2 | Noticeboard voting | A notice can include a vote: a question, the options, who can vote and a closing date. One vote per person; results are shown on the notice when voting closes |
| A3 | National circulars | Sent by the General Council to all branches, or to selected branches |
| A4 | Read confirmation | Shows which branches have opened each national circular |

### Stage B — Conversations

| # | Sub-point | Covers |
|---|---|---|
| B1 | Role networks | Officers holding the same role across branches, for example all treasurers or all secretaries, in their own shared space |
| B2 | Topic discussions | Threads on a specific subject, open to the officers invited to it |
| B3 | Requests between branches | One branch asks another for help, equipment or information. Each request is marked open, answered or closed |

### Stage C — Notifications

| # | Sub-point | Covers |
|---|---|---|
| C1 | Notifications | Alerts in the portal and on the phone for new notices, votes, circulars, replies and requests |
| C2 | Notification settings | Each officer chooses which alerts they receive; national circulars always notify |

**Request status:** Open → Answered → Closed

**Links:** Event organiser (event published to the Noticeboard); Meeting recorder (two automatic messages only); Committee register (roles used to build role networks).

**Rules**
- Automatic posts from other services appear on the Noticeboard and are marked as automatic.
- The Meeting recorder's interaction with the hub is limited to its two messages.
- Voting is a feature of the Noticeboard: one vote per person, results shown when the vote closes.
- Noticeboard votes are separate from formal meeting votes, which stay in the Meeting recorder.
- National circulars always notify and cannot be switched off (enforced on the server).
- Role network membership is derived live from current terms; never stored separately.
- One vote per person is enforced by a unique constraint.

**Settings:** alert types switched on for new officers.

**Proposals awaiting confirmation:** P11, P12, P13, P14.

**Build notes**
- Push through `core/notifications` and a Queue. iPhone push requires the portal on the home screen (iOS 16.4+); show the install guide text from 15 C4.
- Export `postAutomatic(unitId, kind, payload)` in `communication-hub/index.ts`, callable only by the Event organiser and Meeting recorder.

---

## 21. Service 1 — Event organiser

**Purpose.** Covers the full life of an event, from creation to closing. Creating an event sets up three linked things in one step: the event record, its own account in Treasury, and its task list. Progress is calculated from the tasks, and all files are kept with the event.

### Stage A — Create and approve

| # | Sub-point | Covers |
|---|---|---|
| A1 | Create event | Name, type, date and time, branch, lead officer. Automatically creates the event account and task list |
| A2 | Event account | Linked to Treasury: budget lines, income, spending, running balance and receipts for this event |
| A3 | Event templates | Recurring events start with default tasks and budget lines already filled in |
| A4 | Committee approval | Approves the event and its budget together |

### Stage B — Prepare and track

| # | Sub-point | Covers |
|---|---|---|
| B1 | Event tasks | Add, edit, reassign, reschedule or remove tasks at any time until the event is closed |
| B2 | Progress tracker | Completed against total tasks, recalculated live. Overdue tasks are highlighted, but nothing is blocked |
| B3 | Task history | Log of who added, changed or completed each task |
| B4 | Publish | Push the event to the Calendar and Noticeboard |
| B5 | Volunteers | Coming soon — disabled in the UI, nothing built |

### Stage C — Close and report

| # | Sub-point | Covers |
|---|---|---|
| C1 | Post-event report | Automatically pulls task completion and budget against actual spend |
| C2 | Close event | Settles the account, returns any balance to the branch account, files everything to the archive and locks the record |

### Event files — available at every stage

| # | Sub-point | Covers |
|---|---|---|
| F1 | Documents | Bookings, letters, programmes, reports |
| F2 | Media | Photos, videos and flyers |

**Event status:** Draft → Approved → In preparation → Ready → Completed → Closed. The lead officer moves the event forward manually, guided by the progress tracker.

**Links:** Treasury (event account; balance returned on close); Communication hub (published to the Noticeboard); Calendar (published to the Calendar); Task tracker (event tasks); Documents archive (event files filed on close).

**Rules**
- Tasks are fully flexible and can be changed at any time; the tracker informs but never blocks.
- Event files are split into two sections only: Documents and Media.
- Not included: venue and equipment booking, risk and safeguarding check, RSVP and registration, and on-the-day recording (attendance count, takings).
- Money collected on the day is recorded as ordinary income in the event account.
- Volunteers is deferred until public members are available.

**Settings:** whether event status may move backwards; whether cancelled tasks count in progress; event types come from the list in 15 B3.

**Proposals awaiting confirmation:** P10, P15, P16.

**Build notes**
- End-to-end test: create from template → approve → tasks → publish → spend → complete → report → close → verify account at zero, receiving account increased, archive filed, event locked.

---

## 22. Service 2 — Meeting recorder

**Purpose.** Covers a committee meeting from setting it up to logging the final report. Attendees are selected from the officers list, the agenda can be updated as points are raised during the meeting, and each agenda item records every attending officer's comments before concluding with a vote or decision. Everything is brought together into one full report, logged and locked in the meeting record.

### Stage A — Set up the meeting

| # | Sub-point | Covers |
|---|---|---|
| A1 | Meeting details | Type, date, time, place or online link, chair and secretary. When saved, one message goes to the Communication hub: meeting scheduled |
| A2 | Attendees | Selected from the officers list. On the day, each is marked present or sending apologies |
| A3 | Agenda | Set before the meeting and can be updated during the meeting as new points are raised. Added points are marked "raised in meeting" so the original and updated agenda are both clear |

### Stage B — Minutes

| # | Sub-point | Covers |
|---|---|---|
| B1 | Officer comments | Under each agenda item, each attending officer's comments are recorded against their name |
| B2 | Vote or decision | Each agenda item concludes with either a vote (for, against, abstain, and the result) or a decision |

### Stage C — Meeting report

| # | Sub-point | Covers |
|---|---|---|
| C1 | Full report | Brings together the meeting details, attendees and apologies, original and updated agenda, all comments, and every vote and decision. Logged into the meeting record and locked. When logged, one message goes to the Communication hub: meeting has taken place |

**Meeting status:** Scheduled → Held → Report logged

**Links:** Communication hub (two automatic messages only); Calendar (meeting date shown); Committee register (officers list used to select attendees); Documents archive (logged report filed).

**Rules**
- Communication hub interaction is limited to two messages: meeting scheduled and meeting has taken place. Nothing else.
- Attendees are selected from the officers list only.
- The agenda stays open for updates during the meeting; points raised in the meeting are marked as such.
- Minutes are recorded per agenda item as each attending officer's comments, concluded by a vote or decision on that item only.
- The full report is logged into the meeting record and locked; no changes after logging.
- Not included: notice and draft circulation, actions sent to the Task tracker, matters arising, and meeting papers.

**Settings:** meeting types come from the list in 15 B3; autosave interval for minutes.

**Build notes**
- Minutes autosave so nothing is lost on a weak phone signal; saves use the version check.
- Test that no path other than A1 and C1 sends a hub message.

---

## 23. Service 7 — Correspondence and letters

**Purpose.** Covers formal letters in both directions. To send a letter, an officer picks a template from the Resources library, fills in the details, and the portal generates a PDF on the branch letterhead, signed with the officer's name and role. Every letter sent or received is given a reference number and logged in its register, while the letters themselves are stored in the Correspondence section of the Resources library. Replies are linked to the letters they answer, so each exchange can be followed from start to finish.

### Stage A — Writing letters

| # | Sub-point | Covers |
|---|---|---|
| A1 | Letter templates | Chosen from the Correspondence section of the Resources library (D1) |
| A2 | Generate PDF letters | Fill in a template, preview, and generate a PDF on the branch letterhead with the signing officer's name and role from the Committee register |

### Stage B — References and registers

| # | Sub-point | Covers |
|---|---|---|
| B1 | Reference numbers | Given automatically, for example branch code, year and number, with separate sequences for letters in and letters out |
| B2 | Letters out register | Every generated letter logged: reference, date, recipient, subject, sent by. The PDF is stored in the library under Letters out (D2) |
| B3 | Letters in register | Received letters logged: reference, date received, sender, subject, officer handling it. The scan or photo is stored in the library under Letters in (D3) |
| B4 | Linked replies | A reply is linked to the incoming letter, which is marked awaiting reply, replied, or no reply needed |

**Letter in status:** Received → Awaiting reply → Replied (or No reply needed)

**Links:** Resources library (templates from D1; letters out stored in D2; letters in stored in D3); Committee register (signing officer's name and role).

**Rules**
- All correspondence is stored in the Resources library under its Correspondence section; this service creates and registers letters but does not store them itself.
- Letter templates can be national or branch; letters in and out are visible to the branch only.
- Reference numbers are automatic, with separate sequences for letters in and letters out.
- Replies are linked to the letters they answer.
- The Correspondence service has no interaction with the Communication hub.

**Settings:** reference number format for letters out and for letters in (built from placeholders such as unit code, year and number).

**Build notes**
- Numbers are allocated in SQL inside the same batch as the register entry, from a counters table (`UPDATE … RETURNING`). Test concurrent generation.
- The signing block uses the officer's name and current role in that unit.

---

## 24. Service 12 — Achievements and reports

**Purpose.** Records what each branch has accomplished, builds up its history over the years, recognises officers' contributions, and produces the annual report. Officers record achievements as they happen, and these form the branch timeline, with each achievement credited to the officers involved. At the end of the year, the annual report is put together automatically from the year's achievements and a summary from other services, reviewed by the branch, then finalised and locked.

### Stage A — Achievements

| # | Sub-point | Covers |
|---|---|---|
| A1 | Record achievement | Title, date, description, category, officers involved, and photos |
| A2 | Branch timeline | All the branch's achievements in date order, forming its history |
| A3 | All-branches view | Achievements from every branch together, for the General Council |

### Stage B — Recognition and reporting

| # | Sub-point | Covers |
|---|---|---|
| B1 | Officer contributions | Each officer's achievements and the roles they have held, including past officers |
| B2 | Annual report | Brings together the year's achievements, events completed, meetings held, the Treasury year-end summary and the current officers. Reviewed, then finalised and locked |

**Annual report status:** Draft → Finalised

**Links:** Event organiser (events completed); Meeting recorder (meetings held); Treasury (year-end summary); Committee register (officers and roles; current officers); Documents archive (finalised annual report filed).

**Rules**
- Achievements are recorded by officers as they happen and form the branch timeline.
- The General Council can see achievements from all branches together.
- Officer contributions include past officers, drawing on the Committee register.
- The annual report is assembled automatically, reviewed by the branch, then finalised and locked.
- Links to other services are for the annual report only; there is no interaction with the Communication hub.

**Settings:** achievement categories come from the list in 15 B3; what period the annual report year covers.

**Proposals awaiting confirmation:** P17, P18.

---

## 25. Service 15 — Administration panel

**Purpose.** One control panel from which the data administrator configures and runs the portal: who has access, what each role can do, every setting and list, branding, service switches, and the health, backups and records of the system.

### Stage A — Access and permissions

| # | Sub-point | Covers |
|---|---|---|
| A1 | System administrators | Appoint and remove system administrators (General Council unit); multi-factor required |
| A2 | Officer accounts | Every person with their access state (Not invited, Invited, Active, Not linked, Locked). Resend invitation, lock or unlock, sign out of all sessions, revoke calendar feed token, remove push devices. Register details are edited in the Committee register, linked from here |
| A3 | Permissions matrix | Roles × capabilities × scope, editable. Fixed rules shown locked. Every change versioned and restorable |
| A4 | Access check | Pick an officer and see exactly which capabilities and scopes they have. Shows permissions only, never their data. No impersonation |

### Stage B — Organisation

| # | Sub-point | Covers |
|---|---|---|
| B1 | Units | Branches and the General Council: name, code, area, status, letterhead address, calendar colour. Editable only by the national register officer |
| B2 | Roles | Standard roles list (national register officer), whether branches may add extra roles, and which roles are designated as branch register officer and national register officer |
| B3 | Lists | Event types, meeting types, achievement categories, equipment conditions, handover checklist items. Archive categories shown as fixed |

### Stage C — Configuration

| # | Sub-point | Covers |
|---|---|---|
| C1 | Service settings | Every registered setting, grouped by service, with national value and unit overrides where allowed, validation, history and restore |
| C2 | Service switches | Turn services on or off portal-wide or per unit, with dependency checks; never deletes data |
| C3 | Branding and letterhead | Organisation name in English and Arabic, logo, colours, fonts (Latin and Arabic), letterhead layout in English and Arabic, signature block layout, with a live PDF preview in both languages |
| C4 | Notifications | Alert types switched on for new officers; iPhone install guide text |
| C5 | Texts | Privacy notice, "access not active" message, help text, each in English and Arabic |
| C6 | Setup checklist | Every required setting, list and designation not yet configured, per service and unit. A service cannot be switched on for a unit until its checklist is complete |

### Stage D — Operations

| # | Sub-point | Covers |
|---|---|---|
| D1 | System health | Last run and outcome of every scheduled job, queue backlog, failed jobs with retry, push delivery failures, storage used per unit |
| D2 | Audit log | Search and filter every recorded action by person, service, record and date; export as CSV. Read-only |
| D3 | Backups | Status of backups, list of backups, run a backup now. Restoring follows the written procedure in `docs/operations.md`; there is no restore button |
| D4 | Data import | CSV import at launch for units, people with current and past terms, and branch accounts with opening balances. Dry run with a validation report first; safe to re-run without duplicates |
| D5 | File housekeeping | Orphaned file report and storage used |
| D6 | Maintenance mode | Put the portal into read-only mode with a banner |

**Rules**
- Units and standard roles remain the national register officer's powers; the panel is where those screens live.
- Administrators cannot edit locked records, delete Treasury entries or archive items, or bypass any Rule. There is no database console.
- Every change in the panel is recorded in the audit log with before and after.
- Member data requests belong here at a later stage; build nothing for them now.

**Settings:** backup retention; orphan file age; push retry count; download link size and lifetime; file types and limits; maximum image dimension.

**Proposals awaiting confirmation:** P21, P22.

**Build notes**
- The admin area is a separate layout at `/admin`, visible only to people with at least one administration capability. Each screen checks its own capability.
- Settings screens are generated from the settings registry, so every new setting appears automatically in C1 and C6.
- Backups export D1 (using the D1 export API with a scoped Cloudflare API token, or a table-by-table dump) to the backup bucket.

---

# PART 4 — THE BUILD

## 26. Phases

Every phase ends with: all tests passing, lint passing (including file size and import boundaries), the permission sweep passing, a deployed preview, a phase report, and a stop for owner review. Before starting a phase, list any P-items and owner inputs it needs; if they are not confirmed, stop and ask.

### Phase 0 — Foundation
- Repository, TypeScript, ESLint (with `max-lines`, `max-lines-per-function` and import boundary rules), Prettier, Vitest with the Workers pool, Playwright.
- `wrangler.jsonc`: D1, R2 (main and backup), Queues, Cron Triggers, Browser Rendering, static assets; separate preview and production environments with separate databases and buckets.
- Clerk: middleware, signed webhook, invite-only, "access not active" page.
- Core modules: permissions (capability catalogue and `can()`), settings registry, service switches, audit log, notifications, files, PDF, push, ids, dates, money, events bus, errors, security headers, maintenance mode.
- Frontend shell: sign-in, portal layout, admin layout, navigation for every stage-one service (empty pages), unit switcher for people in more than one unit, PWA manifest and service worker, privacy notice on first sign-in, the `text/` folder with English and Arabic, right-to-left switching, and the officer's language choice.
- CI: lint, tests and permission sweep on every push; deploy preview on main.
- Ask the owner: Cron schedules, and the questions in Part 5 marked Phase 0.

### Phase 1 — Committee register (8) and Administration access and organisation (15 A, B, C6)
Units, people, terms, roles, role designations, elections, handovers, past officers, invitations. Admin: system administrators, officer accounts, permissions matrix, access check, units, roles, lists, setup checklist. Load the owner's seed files. Deliver `docs/permissions.md` (the capability catalogue).

### Phase 2 — Administration configuration (15 C1 to C5)
Settings screens from the registry, service switches, branding and letterhead with PDF preview, notification defaults, texts.

### Phase 3 — Documents archive (13) and Resources library (6)
The shared file layer and `fileRecord()`. Library D2 and D3 structures exist, populated in Phase 10.

### Phase 4 — Treasury (3)
Branch accounts, all entry rules, approvals, corrections, statements, year-end close. Event account functions internal only. Full integrity suite.

### Phase 5 — Task tracker (9)
Branch tasks, My tasks, action list, reminders, history. Table supports `event_id`.

### Phase 6 — Calendar (5)
Community dates, read-model, views, filters, `checkClashes()`, phone feed.

### Phase 7 — Communication hub (4)
Noticeboard, votes, circulars, read confirmation, role networks, topic discussions, requests, notifications, notification settings, push, queues, `postAutomatic()`.

### Phase 8 — Event organiser (1)
Wires Treasury, Task tracker, Calendar, Noticeboard and Archive. Full lifecycle end-to-end test.

### Phase 9 — Meeting recorder (2)
Full lifecycle end-to-end test, exactly two hub messages, locked and filed report.

### Phase 10 — Correspondence and letters (7)
PDF letters on letterhead, references, registers, linked replies, Library D2 and D3 populated.

### Phase 11 — Achievements and reports (12)
Achievements, timeline, all-branches view, contributions, annual report draft and finalise.

### Phase 12 — Operations and launch (15 D)
- System health, audit viewer, backups, data import, file housekeeping, maintenance mode.
- Full permission sweep review and written security review of every route.
- Immutability review: try to change every locked thing through every route.
- Hard-coding review: search the code for literal values that should be settings, lists or texts.
- Accessibility and phone layout pass. Indexes for every list and search; pagination everywhere.
- Production: custom domain, Clerk production instance, real data imported from the owner's files.
- `docs/operations.md`: deploying, restoring from backup and D1 Time Travel, rotating secrets, adding the first officers, recovering if administrators lose access.

## 27. Testing

For every service:
- Unit tests for business rules; API tests against local D1.
- Every status transition, valid and invalid.
- Permission sweep entries for every route.
- Locking and immutability tests wherever this document says locked, read-only or never deleted.
- Tests for every rule in section 10.2.
- Settings tests: each setting changes behaviour as described; an unset required setting refuses the action with the "not configured" message; no setting can break a Rule.

End-to-end (Playwright): sign in; create and close an event; hold and log a meeting; send and receive a letter with a linked reply; post a notice with a vote and see results; record a debit above the threshold and approve it as a second officer; change a setting in the Administration panel and see it take effect.

A phase is not done while any test is skipped or failing.

## 28. Frontend guidelines

- Plain, calm and readable, for volunteers of varied confidence, mostly on phones. Mobile first; forms usable with one thumb.
- Every service follows the same pattern: list, detail, create or edit form, status badge, history panel where there is history.
- Exact names and status labels from this document.
- Locked and read-only items are clearly marked and show no edit controls.
- Warnings (overdue tasks, date clashes, terms ending soon, missing receipts) inform but never block.
- Automatic Noticeboard posts are labelled automatic.
- Receipt photos can be taken with the phone camera directly.
- English and Arabic throughout (section 8.5). English screens use UK English, dates as `19 September 2026` and money as `£1,234.56`; Arabic screens use the Arabic equivalents from `Intl`.
- All texts from `src/web/text/` or the database, never inline.
- Layouts use logical CSS properties only (`margin-inline-start`, never `margin-left`), so every screen works in both directions. Every screen is checked in both languages before a phase closes.
- End-to-end tests run key journeys in both English and Arabic.

## 29. Working rules (copied into CLAUDE.md)

1. Follow the owner's six critical rules in section 1 at all times.
2. Read the service's section before touching it, and again before finishing.
3. One phase at a time. Stop and wait for approval.
4. Never build a P-item until it is confirmed in `docs/decisions.md`.
5. Every route declares a capability. Every unit-data query filters by scope.
6. Money is integer pence. Treasury entries are never updated or deleted.
7. Locked means locked: in the service and with a trigger.
8. Consistent cross-service writes go in one D1 batch, with logic in SQL. Files go to R2 before the batch. Notifications go through the Queue.
9. Services import each other only through `index.ts`.
10. Check every dependency runs on Cloudflare Workers.
11. Never weaken, skip or delete a test, and never disable a lint rule, to make something pass.

---

# PART 5 — OWNER INPUTS AND PROPOSALS

## 30. Owner inputs needed

These are values only the owner or data administrator can provide. Nothing is invented for them.

| Input | Needed by |
|---|---|
| General Council name and code | Phase 1 seed |
| First system administrators and national register officer (names and emails) | Phase 1 seed |
| Standard roles list, and which roles are the register officer roles | Phase 1 seed |
| Branches (name, code, area) | Phase 1 seed or Phase 12 import |
| Current and past officers | Phase 12 import |
| Permissions matrix | Entered in 15 A3 during Phase 1 review |
| All settings and lists | Entered in 15 B3 and C1 before each service is switched on |
| Logo, colours, fonts (Latin and Arabic) and letterhead design, in English and Arabic | Phase 2 |
| Privacy notice and other texts, in English and Arabic | Phase 2 |
| Approval of the Arabic interface texts Claude Code drafts | Each phase report |
| Opening balances | Phase 12 import |
| Cron schedules | Phase 0 |
| Rate limits | Phase 12 |
| Domain name | Phase 12 |

## 31. Proposals awaiting confirmation

These were written into this brief to fill gaps in the service specifications. None may be built until the owner confirms it. Each one is raised in the report of the phase before it is needed.

| # | Proposal | Needed by |
|---|---|---|
| P1 | The General Council runs its own events, meetings, treasury, tasks, letters and achievements, exactly like a branch | Phase 1 |
| P2 | Because the archive shows every branch's documents to the General Council, it can read branches' filed statements, meeting reports and closed events there, even where it cannot see the live records | Phase 3 |
| P3 | Election candidates can be people not yet in the portal; a person record is created without access, and on confirmation they get a term and an invitation | Phase 1 |
| P4 | An inactive branch becomes read-only everywhere: nothing new can be created, existing records stay readable by its officers, and it is never deleted | Phase 1 |
| P5 | A person can hold several current terms at once, in different units or roles | Phase 1 |
| P6 | A branch account's opening balance is recorded as an entry of type Opening balance, needing no receipt | Phase 4 |
| P7 | A debit above the threshold is saved as Awaiting approval and does not affect the balance; it becomes Approved or Declined; a declined debit stays in the history with who declined it and why | Phase 4 |
| P8 | The transfer made automatically when an event closes does not need payment approval | Phase 4 |
| P9 | Statements can be generated freely to view or download; one is filed to the archive only when an officer chooses "File statement"; the year-end close files a statement for every account | Phase 4 |
| P10 | Credits and debits in an event account can be tagged to a budget line; untagged amounts show as "Unallocated" in the post-event report | Phase 4 |
| P11 | Eligible voters are chosen when a vote is created: all officers of the unit, officers holding chosen roles, or named officers | Phase 7 |
| P12 | A vote cannot be changed once cast, and results are hidden until the vote closes | Phase 7 |
| P13 | A request can be sent to one branch, several branches, or all branches | Phase 7 |
| P14 | A branch counts as having opened a circular the first time any of its officers opens it | Phase 7 |
| P15 | Event templates are national or branch, and are managed in the Event organiser | Phase 8 |
| P16 | When an event closes, the officer closing it chooses which branch account receives the balance | Phase 8 |
| P17 | "Events completed" in the annual report means events that reached Completed or Closed during the year | Phase 11 |
| P18 | If the financial year is not closed, the annual report's Treasury figures are marked "Provisional"; finalising shows a warning but is not blocked | Phase 11 |
| P19 | Letter templates are structured records (title, subject, body text with named fields, field list, language English or Arabic), edited with a live preview, rather than uploaded files | Phase 3 |
| P20 | An equipment loan records the borrower's name as free text, plus the return date | Phase 3 |
| P21 | At least two system administrators must exist at all times; the last two cannot be removed | Phase 1 |
| P22 | The administrator role gives no access to content (letters, Treasury entries, discussions); it controls configuration, access and operations only | Phase 1 |
| P23 | The lawful basis for keeping officers' data permanently is the organisation's legitimate interest in its governance records | Phase 2 |
