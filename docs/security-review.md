# Security review (Phase 12)

Brief section 26, Phase 12: "a written security review of every route". Written on 2026-09-28 against commit `e0109e8` plus the Phase 12 changes that follow it. Every statement here was checked in the code or by a test. Where a check could only be done by hand, it says so.

## 1. How every route is guarded

- **Every route declares its access.** Each one calls `registerRoute` with one of seven access kinds (`src/worker/core/permissions/route-access.schema.ts`). The permission sweep (`tests/permissions/app-route-sweep.test.ts`) builds the real app and fails when:
  - any `/api/` route Hono serves has no declaration;
  - any declaration differs from its sweep entry.
- **The count on 2026-09-28:** 315 routes.

| Access kind | Routes | What guards it |
|---|---|---|
| `capability` | 255 | `requireActiveAccess` (a signed-in, active officer who has acknowledged the privacy notice, with MFA where the role needs it). Then the service calls `can()` for the named capability, at the unit in the path. |
| `signed-in-only` | 53 | The same `requireActiveAccess`, or `requireSignedIn` for `/api/me`, the language, the privacy notice and the "access not active" text. The service then checks the officer's own relation to the record (list below). |
| `signed-webhook` | 1 | `POST /api/webhooks/clerk`: Clerk's signature, checked by `verifyWebhook`. An unsigned or wrongly signed call is refused. It has its own rate limit. |
| `calendar-feed-token` | 1 | `GET /calendar/feed/:token`: the token is 32 random bytes; only its SHA-256 hash is stored. It opens only its owner's feed, can be replaced at any time, and has its own rate limit per link. |
| `public-install-file`, `public-install-icon` | 3 | The web manifest and the two app icons. They carry only the organisation's name and icon, which the install prompt shows before anyone signs in. |
| `public-font-file` | 2 | The two font files the administrator uploaded. They carry no personal data. |

### Capability checks

- **`can()` is the only check that decides** (T-042). It re-reads grants joined to current terms on every call, and resolves the scope against the unit in the path. Nothing is cached between requests.
- **No code checks a role name.** Brief 7.3's fixed rules use role designations, through `fixedGrants` in the catalogue.
- **The behavioural sweep** (`tests/permissions/route-sweep-behavioural.test.ts`) signs in over real HTTP and checks three refusals, each ending in 403 or 404:
  - a Branch A officer reading Branch B;
  - a branch officer attempting a national action;
  - a system administrator reading content (P22).

### Routes without a capability, and what the service checks

Each group was read by hand on 2026-09-28. Each check has its own route tests.

- **The officer's own things** (nothing to grant, D-004). Every query uses the caller's own person:
  - `/api/me`, the language, the privacy notice and its acknowledgement;
  - the inbox (list, unread count, mark read, mark all read);
  - the calendar feed token;
  - alert choices;
  - push subscriptions;
  - My tasks.
- **Circulars** (received, one circular, sent): the caller must be a current officer of the unit in the path. Sent circulars are for the General Council's officers only.
- **Requests** (list, replies, reply): the caller must be an officer of a unit the request involves.
- **Discussions** (list, messages, members, leave, remove): the caller must be a member, and inviting or removing needs the starter. **Role networks:** the caller must hold that role now. **Removing a message:** only its author.
- **Letters in** (one letter, its file, its status): the handling officer, or a holder of the letters-in capability for that unit (O-135).
- **Events** (status, cancel, files): the event's lead officer, or a holder of "Manage events" for that unit.
- **Meetings** (hold, attendance, agenda points, comments, outcome, log report): the chair or secretary of that meeting, or a holder of "Manage meetings" for that unit.
- **Tasks** (status, history): the task's owner, or a holder of the unit's task capability.
- **Texts and branding** (help text, "access not active", branding): the same for every officer. No personal data.

## 2. Authentication and sessions

- **Clerk sessions** are verified inside the Worker with the published keys, with no network call.
- **Access:** a person with no current term, or a locked account, gets "access not active" (6.2). The portal keeps roles and unit membership in its own database, never in Clerk.
- **MFA:** roles listed in "Roles that require two-step sign-in" must have a second factor on the session. It is checked in `resolve-session-state.ts`.
- **Rate limits** (O-163): uploads, session calls, the calendar feed and the webhook each have a Workers rate limiting binding, with separate counters in each environment. Over the limit returns 429.

## 3. Data and files

- **Unit scope:** every unit-data query filters by the unit in the path, after `can()` has resolved that unit (build rule 1). The behavioural sweep and each service's cross-branch tests cover this.
- **Uploads:** they go straight to R2 through a signed link that lasts 15 minutes. When the upload completes:
  - the object's size and declared type are checked against the administrator's list for that use;
  - an object that fails is deleted and never recorded;
  - R2 is written first, then the D1 record (build rule 7).
- **Serving files:** files are served with their recorded type and `X-Content-Type-Options: nosniff`. Large files use a short-lived signed R2 link.
- **File types (D-218, T-161):** the Worker enforces a fixed ceiling, whatever an administrator sets:
  - PDF, JPEG, PNG, DOCX and XLSX only, plus MP4 for the video use and the three font types for the Branding fonts;
  - never HTML, never SVG;
  - a setting can't allow a type outside its use's ceiling;
  - a stored value that breaks the rule counts as not set, so uploads wait;
  - every upload is refused if its type is outside the ceiling;
  - every stored file's first bytes must match its declared type, or it is deleted and refused.
- **Headers on every response:**
  - a Content-Security-Policy that allows only the portal's own origin and Clerk's hosts, with `frame-ancestors 'none'` and `form-action 'self'`;
  - HSTS, `nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
  - `'unsafe-inline'` scripts are added only on the Vite dev server (`import.meta.env.DEV`), never in a built Worker.
- **Logs:** the Worker logs only error names and fixed phrases ("unhandled error", "invitation failed", "clerk account action failed"). It never logs personal data (build rule 12). Checked by `grep` on 2026-09-28.
- **Secrets:** only in `wrangler secret` and `.dev.vars`, which is ignored by git.
  - `wrangler.jsonc` lists the required secrets for preview and production: Clerk (three), VAPID (three) and the R2 signing keys (three).
  - `seed/` holds the owner's real data. It is ignored by git (`/seed/`) and never committed.
- **Audit log:** append-only, with triggers. The before and after values are shown only for Administration panel actions, units and standard roles (P22, O-167).

## 4. Immutability

Every locked thing was tried through every route that could change it, as well as in the database. `docs/immutability-review.md` has the table, and records what the review found and fixed.

## 5. Items the owner asked to check by hand

- **D-197 / T-149, Chrome without its sandbox:** confined to the browser tests.
  - The sandbox is switched off only by `CI: '1'` in `playwright.config.ts`'s `webServer.env`, which starts the tests' own dev server.
  - Nothing in `src/`, `wrangler.jsonc` or `.github/` mentions the sandbox.
  - In preview and production, PDFs come from Cloudflare Browser Rendering, whose browsers Cloudflare runs. No local Chrome is involved.
  - **Checked 2026-09-28 by `grep`. Check again before launch.**
- **T-045, the core-to-core import gap:** no lint rule stops one `core/` module importing another's inner file.
  - Checked by hand on 2026-09-28: no file in `src/worker/core/` imports a sibling module's inner file. Each uses the sibling's `index.ts`.
  - It stays a known limitation, to check by hand at each review.

## 6. Before launch

1. **Rate limits:** confirmed on the preview, 2026-09-28. It serves a route added after the bindings, so the deploy that carries them succeeded.
2. **Production:** the database, buckets, Queue, domain and secrets are created by the owner (`docs/operations.md`). Nothing has been run against production.
3. **Sandbox:** repeat the D-197 check above on the commit that goes live.
4. **File types:** the Worker enforces them (section 3). The administrator picks, for each use, within the ceiling.
