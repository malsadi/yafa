# Decisions

Every owner answer and every confirmed P-item is recorded here. Nothing under "Owner decisions" is inferred. Technical choices made by Claude Code (allowed by CLAUDE.md, "What to ask the owner, and what to decide yourself") are recorded under "Technical decisions" and listed in each phase report.

**Note on the specification.** On 2026-09-20, after D-001 to D-011 were recorded, the owner replaced both `CLAUDE.md` and `system build prompt.md`. Section numbers quoted in D-001 to D-011 refer to the earlier brief. In the current brief, section 8.5 is "Languages and texts" (it was "Texts" before), and the portal is English and Arabic from launch.

## Owner decisions

### D-001 Cron schedules (brief section 11 and 30)

All times are UTC. Cron Triggers cannot change at runtime, so these are set in `wrangler.jsonc`.

| Job | Schedule | Cron expression |
|---|---|---|
| Close votes | every 15 minutes | `*/15 * * * *` |
| Task reminders | daily at 07:00 | `0 7 * * *` |
| Backup | daily at 02:00 | `0 2 * * *` |
| Orphan clean-up | daily at 03:00 | `0 3 * * *` |
| Push pruning | daily at 04:00 | `0 4 * * *` |

### D-002 The text layer must allow another language later

Superseded by D-013: the portal is English and Arabic from launch, with `src/web/text/` holding one folder per language.

### D-003 Identity tables are created in Phase 0 (option a)

Phase 0 creates only the minimum columns of `units`, `people`, `terms`, `roles` and the permissions matrix table that the Clerk middleware, the webhook and `can()` need. Phase 1 extends them with new migrations. No applied migration is ever edited.

### D-004 Route classes that declare no capability (brief section 7.4)

Three route classes are allowed to declare something other than a capability:

1. "signed webhook"
2. "signed-in only"
3. "calendar feed token" (for the `.ics` feed)

Every route in these classes is listed in the phase report and checked by the permission sweep. Every other route declares a capability.

### D-005 Privacy notice on first sign-in (brief section 13, 15 C5)

- The officer must tick "I have read this" before continuing.
- The portal records who, when, and which version of the text.
- When the administrator changes the notice, it shows again (timing clarified in D-016).

### D-006 PWA manifest

The manifest is served from branding data. The app is not installable until branding is set. No name or icon is coded.

### D-007 Git host and CI

- Git host: GitHub. The repository is private and empty.
- GitHub Actions runs lint, tests and the permission sweep on every push, and deploys the preview on `main`.
- The Cloudflare API token goes in GitHub secrets, never in the repository.
- The repository path (`owner/name`) was not supplied: the message still contained the template placeholders. See O-002.

### D-008 Cloudflare resource names

The owner approved the naming pattern as proposed (`yafa-portal-<environment>-<purpose>`):

| Thing | Preview | Production (never created by Claude Code) |
|---|---|---|
| Worker | `yafa-portal-preview` | `yafa-portal-production` |
| D1 database, EU jurisdiction | `yafa-portal-preview-db` | `yafa-portal-production-db` |
| R2 files bucket, EU jurisdiction | `yafa-portal-preview-files` | `yafa-portal-production-files` |
| R2 backup bucket, EU jurisdiction | `yafa-portal-preview-backups` | `yafa-portal-production-backups` |
| Queue: notifications | `yafa-portal-preview-notifications` | `yafa-portal-production-notifications` |
| Queue: PDF jobs | `yafa-portal-preview-pdf-jobs` | `yafa-portal-production-pdf-jobs` |

### D-009 Clerk development instance

The owner created it: application id `app_3JZOkbOO4j2kHMfATFKzfco6lyI` (an identifier, not a credential). Sign-up is Restricted and multi-factor authentication is on. The keys are in `.dev.vars` and `.env.local`, placed by the owner. Claude Code never reads those files.

### D-010 Preview resources

Creating resources in the preview environment only is approved, now that the naming pattern (D-008) is approved. Production is never touched.

### D-011 Starting Phase 0

The owner said "go" to start Phase 0 and asked to see any new dependency before it is installed.

### D-012 Governance change: ask about critical things only

From 2026-09-20 the owner wants to be asked only about critical things, batched once per phase. Claude Code decides technical implementation choices within the fixed stack (package versions, config, internal module design, test setup, build tooling, resource names that follow an agreed pattern, small UI interaction details), records them here and lists them in the phase report. When unsure, treat it as critical. Written into CLAUDE.md and brief section 1, rule 1.

### D-013 English and Arabic from launch (brief section 8.5)

The portal works fully in English and Arabic from launch, with full right-to-left support. Each officer's language is saved on their person record. `src/web/text/` has one folder per language (`en/`, `ar/`) with one file per service. Claude Code drafts the Arabic texts; they are marked "awaiting owner review" in each phase report until the owner approves them.

### D-014 Approved dependency list and naming pattern

The owner approved the dependency list as proposed on 2026-09-20 (see T-001 to T-005 for the exact versions and pins) and approved the naming pattern in D-008.

### D-015 Plans confirmed

Cloudflare Workers Paid plan: confirmed. Clerk plan with multi-factor authentication: confirmed.

### D-016 Privacy notice re-show timing (answer to O-007)

When the administrator changes the privacy notice, it is shown again the next time the officer opens the portal.

### D-017 GitHub repository (answer to O-002)

`git@github.com:malsadi/yafa.git`, private. The owner set the remote up directly (confirmed present via `git remote -v` before the first push) and confirmed SSH works. Before that first push, `.dev.vars`/`.env.local`/`.env*` were confirmed covered by `.gitignore` (`git check-ignore -v`) and absent from `git status`. Pushed 2026-09-22. Force push is never used.

### D-018 Commit cadence

Commit after every piece of finished work that passes lint, typecheck and tests. Short, plain commit messages. Applies from 2026-09-22 onward (answers the workflow question raised when resuming Phase 0).

### D-019 What counts as a "current" term (answer to O-006)

A term with no end date is current until it is explicitly ended. A term whose end date has passed counts as Past from that date onward — **calculated on read, never stored.** There is no separate mutable "status" column to go stale: `terms` has `start_date` and a nullable `end_date`; "Current" vs "Past officer" (brief section 14's two status values) is a value derived at query time from `end_date` versus now, not a column the code or an officer sets directly. This replaces the "status field, checked against end date" idea sketched in the Phase 0 draft's database plan — supersedes that detail of T-021/the design plan's `terms` column list.

### D-020 Service switches: build order (answer to O-005, build-order half)

Build `core/service-switches` as its own module in Phase 0, exactly as the brief describes it (section 8.4): each service switched on/off portal-wide or per unit; switching off hides it and blocks its routes without deleting data; the switch refuses combinations that break a dependency; the Committee register, Documents archive and Administration panel can never be switched off. The Administration panel's own switch **screens** (15 C2) are Phase 2, not Phase 0 — Phase 0 ships the checking mechanism with no UI to edit it yet. Only the one dependency the brief states (Event organiser needs Treasury) is encoded now; the full cross-service dependency list is still needed before Phase 2 builds the switch screen (unchanged ask, not urgent while there's no UI). The resolution order proposed when this was first raised — no switch row recorded for a (unit, service) pair means off, except the three that can never be off; a unit's own row overrides the portal-wide row, which is the default for units without their own — was shown to the owner as the proposed handling and not contested when they said to build the module now, so it is what's built; flag it back if that's not what was meant.

### D-021 Admin area visibility (answer to O-008, visibility half)

The admin area and its navigation are shown only to people holding at least one Administration-panel capability. Each admin screen checks its own capability separately (no single "is admin" gate covering every screen). The other half of O-008 — system administrators as a plain list of people — wasn't separately reconfirmed in this answer; it stays as recorded in T-021 (a modelling choice, not a permissions question, so treated as settled rather than re-raised).

### D-022 Missing-translation runtime fallback, for database-stored bilingual text only

If an Arabic value is missing from a database-stored bilingual text (privacy notice, "access not active" message, help text, branding/letterhead — 15 C3 to C5, entered by the data administrator in both languages), the portal shows the English value and records that the Arabic one is missing. This is separate from, and does not relax, the static `src/web/text/{en,ar}/` source-code text keys: brief section 8.5's test that fails the build when a key exists in one language folder and not the other still applies there unchanged, since those keys are Claude-drafted in both languages together and never partially entered.

### D-023 `.dev.vars`/`.env.local` confirmed present (resolves O-009)

Owner, 2026-09-22: "Keys: fixed. Both files now exist in /home/albions/Yafa. Confirm by name only, never open them." Confirmed by `ls -la` on the project root this session: both files are present. Contents not read, and never will be. O-009 is resolved; nothing further blocks running the app locally against Clerk or the preview deploy on this account.

### D-024 Privacy notice gate before any notice has ever been entered (resolves O-003, narrows further)

Owner, 2026-09-22, verbatim: "if no privacy notice text has been set yet, no officer can be invited or sign in beyond the 'access not active' page. The administrator must set the notice first. It appears in the setup checklist (15 C6) as required before anything else." This is the exact bootstrap case O-003 asked about (distinct from D-005/D-016, which cover the tick-box/re-show mechanism once a notice exists) and it is now answered, not proposed.

This answer does not by itself explain how the *first* administrator — who must set the notice — gets in: 6.2 says an officer is invited to Clerk by a register officer and only reaches a working screen once they hold a current term with access; the first system administrators come from Phase 1 seed data, not an in-portal invite. Whether system administrators are exempt from this specific gate (so they can reach the notice-setting screen and set it) is not addressed by the answer above and is not decided here. New open item, batched: see O-010 in "Open".

### D-025 PWA manifest route (resolves O-004)

Owner, 2026-09-22, verbatim: "the PWA manifest is public with no access class. It contains only branding, never data. Note it in the phase report as the one public route." This is not the same as the proposed fifth route class (`kind: 'public'`) — the owner's own words say the manifest route has *no* access class at all, i.e. it is exempt from the D-004 declaration requirement, not classified under a new kind. When `/manifest.webmanifest` is built (frontend shell step), `route-access.schema.ts`/`route-registry.ts` are not extended with a `public` kind; the route simply never calls `registerRoute()`, and the permission sweep and phase report both list it by name as the one route the portal serves without an access declaration, never carrying data.

### D-026 Officer language fallback, language part only (resolves O-007 (a)/(b); digits part stays open)

Owner, 2026-09-22, verbatim: "officer language fallback — if an officer has no language saved, use the browser's language when it is Arabic, otherwise English." This answers proposal parts (a) and (b) as stated (not merely confirms the proposal text). Part (c) — what an unset Arabic-digits setting falls back to — was not addressed by this answer and stays open, narrowed: see O-007 (remainder) in "Open".

### D-027 System administrators are not exempt from the privacy-notice gate or the current-term requirement (resolves O-010)

Owner, 2026-09-22, verbatim: "system administrators are not exempt from either. They must accept the privacy notice like everyone else. They must hold a current term to sign in, so the seed gives them one. The only special handling is that the seed creates them without an invitation." No code change: `loadRequestContext()` already requires a current term for anyone, administrator or not (brief section 6.2, built as D-027 now confirms it should be — no shortcut was ever added). This is now a Phase 1 seed-data requirement: the seed file(s) that create the first system administrators must also give each one a `terms` row (role, unit, start date), not just a `system_administrators` row.

### D-028 Permission scope semantics confirmed as implemented (resolves O-011)

Owner, 2026-09-22, verbatim: "confirmed as you read it. Own unit means the units where the person holds a current term. All units means every unit including the General Council. National content means records owned by the General Council unit and shared by a fixed rule, and it never grants access to any branch's own records." This matches T-041/T-050's implementation exactly — `own unit` compares against the specific granting term's own unit, `all units` is unconditional (including the national unit), `national content` resolves against the requested unit's own `type = 'national'` and grants nothing on a branch unit. No code change. `resolveScope()`'s and `can()`'s doc comments are no longer a guess; O-011 is resolved, not just "implemented, unconfirmed."

### D-029 A term grants no powers before its start date — fails closed (resolves O-012, corrects T-040)

Owner, 2026-09-22, verbatim: "a term grants no powers before its start date. Powers begin on the start date and end on the end date, both calculated on read. Fail closed, never open. Add a test for a future-dated term granting nothing." This corrects T-040's earlier guess (currency defined only by `end_date`, a future-dated term granting powers immediately) — that reading is now known wrong, not just unconfirmed. `currentTermCondition()` (`current-term-condition.ts`) now also requires `start_date <= today`, alongside the existing `end_date IS NULL OR end_date > today`; "begins on the start date" is read as inclusive, matching "past... from that date onward" for `end_date`'s exclusive-of-currency boundary the same way (T-040's Europe/London "today" choice is unaffected and still stands). Covered by new tests: a future-dated term grants nothing (`can.test.ts`), and a term starting today is already current (boundary, symmetric with the existing end-date-today test).

### D-030 `core/pdf` may use remote Browser Rendering against preview, sparingly, tracked (resolves O-014)

Owner, 2026-09-23, verbatim: "approved. Use remote Browser Rendering against the preview environment to build and test core/pdf, sparingly. Never production. Record roughly how much you've used in each phase report. Keep the local extraction issue noted in decisions.md in case it's fixable later." This authorizes real, costed calls to Cloudflare's Browser Rendering service — the first money-spending action this project has taken (D-011/rule 1's "anything that costs money" category) — strictly scoped to the `preview` environment, strictly for building/testing `core/pdf`, not as a general habit. T-058's local-extraction finding stays in `docs/decisions.md` unchanged (it's the record the owner asked to keep); this decision doesn't retry or re-litigate it. Every phase report from here must estimate this phase's Browser Rendering usage (call count is enough — Cloudflare doesn't itemize cost per call to this session).

The owner also asked, in the same message, for the two riskiest parts of PDF generation to be proven with a real rendered PDF, not asserted: Arabic text rendered right-to-left with correct shaping, and a font the portal serves itself (not fetched from an outside service at render time) — plus one English and one Arabic sample PDF for review. See T-060 for how this was built and proven, and where the samples were saved.

### D-031 In-portal notifications: read/unread, unread count, mark-all-read, never deleted (resolves O-013)

Owner, 2026-09-23, verbatim: "yes. Notifications are read or unread, with an unread count shown. Opening one marks it read, and there's a 'mark all as read'. Nothing is deleted." Confirms T-057's `read_at`/`markNotificationRead` guess as correct, and adds two behaviours beyond what was built: an unread count (`countUnreadNotificationsForPerson()`) and a "mark all as read" (`markAllNotificationsRead()`), both scoped by `personId` the same way the existing functions are. "Nothing is deleted" matches what's already true — no delete function exists in `core/notifications`, and CLAUDE.md's own "Never" list already forbids adding one for anything not explicitly named there, so no change needed on that point. See T-061.

### D-032 Push retry count: Cloudflare Queues' own `max_retries`, not a hand-rolled counter (resolves O-015)

Owner, 2026-09-23, verbatim: "use Cloudflare Queues' own retry configuration rather than counting retries yourself. The setting exposed to the administrator is the maximum number of attempts, which sets the queue's value." The administrator-facing Setting (name not yet registered — no Queue consumer exists to register it against yet, Phase 7) is the source value for the push Queue consumer's `max_retries` in `wrangler.jsonc`. No code exists yet to change (the Queue consumer is Phase 7); this fixes the design for whoever builds it, so the Setting is never mistaken for something enforced by application code counting attempts itself. **How a Setting change actually reaches `max_retries` at runtime is not yet known and not asked about here** — see T-062: `wrangler.jsonc`'s own `max_retries` is ordinarily static, deploy-time config, but Cloudflare's Queues API may allow updating a consumer's settings without a full redeploy, which was not checked before writing this entry.

### D-033 Undelivered push alerts: shown in the health screen for an administrator-set period; a `gone` subscription is removed immediately (resolves O-016)

Owner, 2026-09-23, verbatim: "an undelivered push alert stays in the health screen for a period set by the administrator. A subscription that fails permanently is removed straight away, as the brief says." Two distinct things, both now settled: (1) a subscription the push service reports as gone (HTTP 404/410, `classifyPushResponseStatus()`'s `'gone'`, T-059) is removed immediately — confirms `buildRemovePushSubscriptionStatement()` should be called as soon as `'gone'` is seen, no batching delay, no administrator involvement; (2) a push that stays `'retry'` through every one of Queues' own attempts (D-032) and is never delivered becomes a record on the health screen (brief section 15 D1), visible for a period the administrator sets — a **new Setting**, not yet named or registered (no health screen exists yet to register it against; Phase 7). This does not answer the literal HTTP `ttl` header value `buildPushRequest()` requires as a parameter (T-059's O-016 wording) — that is now understood to be a small technical detail bounded by Queues' own retry cadence (D-032), not a business rule the brief states, and is left to whoever builds the Phase 7 Queue consumer to set sensibly (e.g., long enough to survive until the next Queue attempt). Nothing in Phase 0's code calls `buildPushRequest()` yet, so there is nothing to change today.

### D-034 Language when nothing is saved: confirmed as built (resolves O-018)

Owner, 2026-09-24: "O-018: confirmed as built." A signed-in officer with no saved language keeps the browser's language until they choose. Before sign-in, a browser preferring neither English nor Arabic is shown English, the first portal language (T-068).

### D-035 A minimal home page (resolves O-019)

Owner, 2026-09-24, verbatim: "keep the home page minimal. Navigation, the officer's name and unit, and a short welcome line from the text files. No dashboard, no counts, no activity feed." Built: `HomePage` at `/` shows the welcome line (`portalShell.home.welcome`) and the selected unit, beside the layout's navigation. **The officer's name is not shown yet:** `people` has no name column until Phase 1 adds the register details (brief section 14 B1). Taking the name from Clerk instead would be a choice made on the owner's behalf (brief section 6.1: register details live in D1). Phase 1 adds the name to `/api/me` and to this page.

### D-036 The PWA install file is built in Phase 2, from branding (resolves O-020)

Owner, 2026-09-24: "O-020: agreed, build the install file in Phase 2 from branding." `/manifest.webmanifest` is not a Phase 0 item any more.

### D-037 Arabic texts are reviewed side by side

Owner, 2026-09-24: "put every English and Arabic pair side by side in docs/arabic-texts-review.md so I can read them in one go." Done: one table per text file, generated directly from `src/web/text/en|ar/`. A translation change updates `src/web/text/ar/` and that file together.

### D-038 R2 enabled, GitHub secrets set, Clerk sign-in fixed; push and preview deploy approved

Owner, 2026-09-24: R2 is enabled; the three GitHub secrets are added; Clerk has social sign-in off, sign-up Restricted and multi-factor authentication on. The owner approved pushing the four commits, creating the R2 buckets and deploying the preview, and will upload the Worker's secrets once the preview Worker exists. Preview buckets `yafa-portal-preview-files` and `yafa-portal-preview-backups` were created with `--jurisdiction eu`.

### D-039 Standing approval to push (supersedes the push-by-push approval of D-017/D-018)

Owner, 2026-09-24, verbatim: "From now on, push after every commit that passes lint, typecheck and tests, without asking each time." Every commit that passes all three is pushed to `origin/main` straight away. Each push also deploys the preview through CI (D-007). Production is still never touched.

### D-040 A public build progress page at `/progress.html`

Owner, 2026-09-24 (verbatim, abridged only by omitting list markers): "Add a build progress page, served by the Worker at /progress.html. One self-contained HTML file, committed and pushed like everything else, so it deploys with every push. Public, no sign-in. This is deliberate: it's for me to check progress from any device. Because it's public, it contains ONLY build progress: phase names, status, what's done, what's left, open questions and proposals awaiting my confirmation, and the last updated date. Nothing about permissions, architecture, security, officers, the organisation, or how anything works internally. Question and proposal wording stays short and neutral. It must not weaken anything: it's the one public route besides the manifest, declared in the route registry with its own access class, covered by the permission sweep, and it must never touch the database. Add a noindex header or tag so search engines don't list it. Plain and readable, English only, works on a phone. Update it in the same commit whenever you finish a piece of work or a phase. It's generated from docs/decisions.md and the phase reports, never a separate source of truth. Record this in docs/decisions.md, add it to the route registry, and add 'update the progress page' to your definition of done in CLAUDE.md." Confirmed by the owner as their instruction the same day.

**Built:**
- **Route and access class.** A fifth access class, `public-progress-page`, is added to the route registry's fixed set (D-004). `GET /progress.html` is registered with it (`src/worker/progress-page/`) and has its own sweep entry. The route is handed only the static assets binding, never the database. A test builds the app with a database that throws on any use, and the page is still served. It carries `X-Robots-Tag: noindex, nofollow` plus a `<meta name="robots">` tag, and the usual security headers. `assets.html_handling` is now `"none"` (checked by a structure test): Workers Assets otherwise also served the file at `/progress`, outside its declared route and header.
- **The page.** `public/progress.html` is generated by `npm run progress-page` (`scripts/progress-page/`). Its only inputs are the phase list from the brief's section 26 headings (names only), each phase report's "Progress summary (public)" block, and `docs/decisions.md`. The generator refuses to build if the open questions listed in the summaries differ from `decisions.md`'s Open table. No scripts, no outside resources, English only, readable on a phone.
- **Guards.** `tests/structure/progress-page.test.ts` fails if the committed page is not exactly what the generator produces from `docs/` (so forgetting to regenerate fails the build), if the noindex tag is missing, if the page loads anything external, or if a summary uses a word pointing at an excluded topic.
- **CLAUDE.md** definition of done gains "The progress page is regenerated and committed with the work."

### D-041 Phase 0 approved; Phase 1 started

Owner, 2026-09-24: "Phase 0 approved. Update CLAUDE.md: Current phase = Phase 1, Approved phases = Phase 0." … "Start Phase 1." Done in `CLAUDE.md`. The owner is reviewing the Arabic texts and the PDF samples separately: "don't wait."

### D-042 Proposals P1, P3, P4, P5, P21 and P22 confirmed as written

Owner, 2026-09-24: "Proposals for Phase 1 — all six confirmed as written: P1, P3, P4, P5, P21, P22." As written in brief section 31:

- **P1:** The General Council runs its own events, meetings, treasury, tasks, letters and achievements, exactly like a branch
- **P3:** Election candidates can be people not yet in the portal; a person record is created without access, and on confirmation they get a term and an invitation
- **P4:** An inactive branch becomes read-only everywhere: nothing new can be created, existing records stay readable by its officers, and it is never deleted
- **P5:** A person can hold several current terms at once, in different units or roles
- **P21:** At least two system administrators must exist at all times; the last two cannot be removed
- **P22:** The administrator role gives no access to content (letters, Treasury entries, discussions); it controls configuration, access and operations only

### D-043 The sign-in screen never shows a "Sign up" link

Owner, 2026-09-24: "Sign-up link: yes, hide it. Officers arrive by invitation only and should never see it." Built: `SignInPage` hides Clerk's `footerAction` element through Clerk's `appearance` option. The end-to-end sign-in test now checks it is hidden in both languages.

### D-044 A scheduled job that isn't built yet does nothing and records a normal run

Owner, 2026-09-24: "A cron trigger with no job registered should do nothing and record a normal run, not an error. I don't want a preview full of errors that hides a real one later." Built: `dispatchScheduledJob` records `outcome: 'success'` for an unregistered job name and returns. This replaces T-063's "throw and record nothing"; the test was rewritten to the new rule, not removed. A cron expression with no job name at all in `vars.CRON_JOBS` still throws, but a structure test keeps those two lists identical, so that can only be a deploy wiring mistake.

### D-045 Progress page redesign: a progress bar and a card per phase

Owner, 2026-09-24 (summarised; full text in the conversation that day): a progress bar for the whole build at the top (a segment per phase: filled for complete, marked for in progress, empty ahead); below it, one card per phase with name, status and a one-line summary; clicking a card opens its detail (built, left, dates, anything waiting on the owner) and clicking again closes it; the current phase open by default; anything waiting on the owner marked on the card itself. Same rules as D-040 (public, build progress only, one self-contained file, generated from `docs/`), working on a phone, in light and dark, calm, with no animation beyond the cards opening. The out-of-date and content tests stay, and a new test checks that with JavaScript off every card is simply open.

**Built:**
- **Cards:** native `<details>` elements, so they open and close with no script at all, which fits the portal's script-free CSP. The phase in progress is rendered `open`.
- **JavaScript off:** a `<noscript>` style reveals every card's detail. A `<noscript>` style applies only when scripting is off.
- **Light and dark:** colours are tokens, redefined under `prefers-color-scheme: dark`.
- **Phase status:** a phase is complete once its summary has an `Approved:` date, in progress while it has a report, and ahead otherwise.
- **Summary format:** each phase report's block gains `Summary:` (one line), `Started:`, `Approved:` and a `Waiting on the owner:` list. The card's "Waiting on you" count adds that list, the open questions and the proposals.
- **Generator:** split into `read-progress-summary`, `phase-stage`, `render-progress-bar`, `render-phase-card`, `progress-page-style` and `render-progress-page` under `scripts/progress-page/`.
- **Tests:**
  - The structure test also checks that only the in-progress card is rendered open, and that the no-script rule is present.
  - `tests/e2e/progress-page.test.ts` checks in a real browser that, with JavaScript on, only the current card is open and a card opens and closes on click, and that with JavaScript off every card is open. It uses `checkVisibility()`, because a closed `<details>` keeps a layout box.
- **Checked by eye** at phone width, in light and dark, with JavaScript on and off.

### D-046 System administrators hold every Administration panel capability (resolves the matrix bootstrap)

Question raised 2026-09-24 while starting Phase 1: the permissions matrix starts empty (brief section 7.2), and each admin screen checks its own capability (D-021), so nobody could ever open the matrix to fill it. Owner, 2026-09-24, choosing from three options: "Always, as system admins". Being a system administrator gives every Administration panel capability, portal-wide. The matrix governs everyone else's powers, and P22 holds: nothing beyond the Administration panel.

**Built:** `can()` returns true for a capability whose service part is `administration-panel` when the person is in `system_administrators`. It re-checks the table itself, never trusting `ctx.isSystemAdmin`, which keeps T-042's principle. Every other capability still needs a matrix grant. The request context's capabilities hint includes every catalogued Administration panel capability for a system administrator, so the admin area shows for them (D-021). `isAdministrationPanelCapability` (`src/shared/core/`) is the one definition, used by the Worker and the web app. Tests: an administrator holds an admin capability with no grant; they hold no content capability (P22); a forged context flag gives nothing; the context hint lists the admin capabilities. Unit and standard-role screens stay the national register officer's alone (brief section 25 rules): those are fixed rules on the designation, not Administration panel capabilities.

### D-047 The preview's root shows the progress page; the portal is one link away

Owner, 2026-09-24, verbatim: "While the build is in progress, visiting the root of the preview shows the progress page instead of the sign-in screen. The progress page gets a clear link to the portal, saying access is by invitation only. No password, no second sign-in. Clerk stays the only way in. This is preview only, never production. A test should prove it. Nothing about permissions or sign-in changes. This is only what a casual visitor lands on. Add it to the route registry with its access class, keep the permission sweep passing, and record it in docs/decisions.md."

**Built:**
- **The switch:** `vars.ROOT_SHOWS_PROGRESS_PAGE` in `wrangler.jsonc`: `true` in `env.preview` only; `false` in `env.production` and at the top level (local development). `tests/structure/wrangler-config.test.ts` proves all three.
- **The root:** where the switch is on, `registerProgressPageRoute` also registers `GET /` with the `public-progress-page` access class (D-040) and serves the same static progress page with the same noindex header. The database is never involved. Where the switch is off, `/` is not registered and falls through to the portal as before. Both cases are tested, and the sweep has an entry for each.
- **The link:** the progress page says "Go to the portal. Access is by invitation only.", linking to `/portal`. The web app's router shows the home page at `/portal`, so a visitor reaches Clerk's sign-in exactly as at the root before. An end-to-end test proves `/portal` shows the sign-in screen.
- **Unchanged:** sign-in, sessions, permissions and every other route.

### D-048 Arabic screens show Western digits until the administrator chooses (resolves O-007)

Owner, 2026-09-24: "O-007: (b) Western 0-9 until the administrator chooses otherwise." Built: `buildDisplayLocale(language, arabicDigits)` in `src/shared/core/` gives `en-GB` for English, and for Arabic `ar-u-nu-latn` (Western) when the Arabic digits setting is unset or set to Western, or `ar-u-nu-arab` when it is set to Arabic-Indic. This replaces T-017's "browser's own default". Tested against real `Intl` formatting.

### D-049 Service switch dependencies: only the stated pair (resolves O-005)

Owner, 2026-09-24: "O-005: (a) only the stated pair. Don't invent dependencies. If a phase reveals a real one, raise it then." `SERVICE_DEPENDENCIES` stays exactly `event-organiser → treasury`.

### D-050 How long an undelivered push alert is kept is an Administration panel setting (resolves O-016)

Owner, 2026-09-24: "O-016: (a) a setting in the Administration panel. It's about how the organisation is run, not a technical detail." Registered with no default when Phase 7 builds the push Queue consumer. Until it is set, push delivery waits and says it's not configured (rule 5).

### D-051 The first privacy notice comes in the seed files; administrators are never exempt (resolves O-017)

Owner, 2026-09-24: "O-017: (b) the first privacy notice text comes in the seed files. Administrators are never exempt from the gate." The seed files gain the notice in English and Arabic (`docs/seed-files.md`). Loading them records the first `privacy_notice_versions` row, so the first administrators meet a real notice to acknowledge. D-024/D-027 stand unchanged.

### D-052 Roles have an English name and an Arabic name (resolves O-021)

Owner, 2026-09-24: "O-021: (b) an English name and an Arabic name for every role."

### D-053 The register holds email and phone, no postal address (resolves O-022)

Owner, 2026-09-24: "O-022: (b) email and phone. No postal address."

### D-054 Branches and the General Council have an English name and an Arabic name (resolves O-023)

Owner, 2026-09-24: "O-023: (b) an English name and an Arabic name for every branch and the General Council."

### D-055 An election result records who was elected, plus each candidate's vote count (resolves O-024)

Owner, 2026-09-24: "O-024: (b) who was elected to each position, plus each candidate's vote count."

### D-056 The progress page redesigned as a public page for the organisation

Owner, 2026-09-24 (summarised): treat `/progress.html` as design work for a public page representing Yafa General Council UK. Content in neutral third person for a public reader: no notes addressed to the owner, no internal shorthand, no question codes, and pending items described in plain words. Considered typography, hierarchy, generous space and a restrained palette; distinctive, not templated. The progress bar and expandable cards stay, crafted rather than functional. A short heading saying the Yafa General Council UK Committee Portal is being built and this shows how it's going. Calm and dignified, a community organisation, not a technology product: no hype, no gimmicks, no animation beyond the cards opening. D-040/D-045's rules stand, now limited to nothing about the organisation's internals, and the out-of-date, content and no-JavaScript tests keep passing.

**Built:**
- **Name:** the portal's name comes from the brief's own title line (`readPortalName`), not from code.
- **Typography:** system font stacks only; a book serif for headings, a humanist sans for reading.
- **Palette:** warm paper and ink, deep green for complete, ochre for in progress, redefined for dark mode.
- **The bar:** numbered segments under a large tally ("1 of 13 phases complete").
- **The cards:** a large phase numeral, the name, a one-line summary, a status with a dot, and "N items pending". Opening a card shows dates written in full, a highlighted "Pending" list, and "Completed so far" beside "Still to do". The static chevron turns with no transition.
- **The summary format:** `Completed:` replaces `Approved:`; `Built:` and `Left:` stay. A single `Pending:` list replaces the owner-facing lists. A pending item that tracks an open question carries its reference in braces (`{O-021}`), which the page never shows but the generator still checks against `docs/decisions.md`. Both phase reports' summaries were rewritten in public wording.
- **Tests:** the content test also rejects internal codes (`O-`, `P-`, `T-`, `D-` numbers) and second-person or "owner" wording in any summary, and a new test rejects any code or brace in the page's visible text.
- **Checked by eye** at phone and desktop widths, in light and dark.

### D-057 The progress page is current in every commit, with a "Now" line and a time

Owner, 2026-09-24: the page doesn't keep up with the work. Diagnose whether it's stale in the repo, stale on the preview, or generated from a source only updated at phase boundaries. Fix it so whatever is being built is visible within the same commit, keeping a small live status in `docs/` if needed as part of the definition of done, and show a "last updated" time on the page.

**Diagnosis:**
- **In the repo:** never stale. The out-of-date test forces the committed page to match its sources.
- **On the preview:** the same as the repo, byte for byte, once CI deploys. The only stale window was T-073's three failed CI runs.
- **The cause:** the source. The page is built from each phase report's summary block, which was updated only when remembered: four of six Phase 1 code commits never touched it. The page also showed a date only, so a fresh page and an old one looked alike.

**Fix:**
- **`docs/current-work.md`:** a public "Now:" line and an "Updated:" date and time. The page shows it as a "Now" panel near the top, and "Last updated 24 September 2026 at 19:40, UK time" under the heading and in the footer, with a `<time>` element.
- **`.githooks/pre-commit`:** turned on by `npm install` through `"prepare": "git config core.hooksPath .githooks"`. It refuses a commit whose "Now:" line didn't change, then stamps "Updated:" with the commit's own time, regenerates the page and adds both, so the time on the page is the commit's. A structure test checks the hook exists, is executable and is wired up, and that the "Now:" line uses public wording.
- **Catch-up:** the Phase 1 summary now lists the work that was missing.
- **CLAUDE.md:** the definition of done gains the rule.

### D-058 The progress page as one bar, in English and Arabic

Owner, 2026-09-24 (summarised): one progress bar and nothing else below it; every phase a segment; clicking a segment opens a panel with that phase's content (done, left, pending, dates), dismissed by clicking elsewhere or a close control; complete, in progress and ahead readable at a glance. Push the design much further: striking and memorable while dignified, the public face of a community organisation, with considered typography, a confident palette and real craft. Everything else unchanged: one self-contained file with no external fonts, scripts or images, generated from `docs/`, working on a phone, light and dark, English and Arabic with the whole layout mirrored, build progress only. The out-of-date, content and JavaScript-off tests keep passing, and with JavaScript off every phase's content is shown in order.

**Built:**
- **No script at all.** The portal's CSP forbids inline scripts, and the page must be one file. Each segment is a `<button popovertarget>` opening its phase's `<section popover>`, HTML's own popover: light dismiss (click elsewhere), Escape, and a close button with `popovertargetaction="hide"`. With JavaScript off, a `<noscript>` style lays every panel out, open, in order below the bar.
- **Design:** *tatreez* (embroidery), used quietly.
  - **Complete phases** are olive cloth stitched through with a cross-stitch lattice.
  - **The phase in progress** is madder red, part-stitched.
  - **Phases ahead** are tacked outlines (a dashed running stitch).
  - **Palette and type:** warm linen and ink with dark counterparts. A book serif for Latin headings, Naskh for Arabic, old-style numerals over the bar, and a large olive tally.
  - **Layout:** a horizontal band on wide screens; on a phone the same bar stands upright so each segment carries its name and status. Panels are centred cards on wide screens and bottom sheets on a phone.
- **Two languages:** `/progress.html` and `/progress.ar.html`, each linking to the other. Both are declared routes with the `public-progress-page` class, never touch the database, and send the noindex header; the preview root still serves English.
- **The wording's sources:**
  - `docs/progress-page-text.md`: the labels in both languages, the Arabic portal name and phase names. The generator checks the English names equal the brief's exactly.
  - Phase summaries: each item is "English || Arabic".
  - `docs/current-work.md`: gains "Now (ar):", and the pre-commit hook requires both "Now" lines to change.
  - The Arabic wording awaits the owner's review (D-013).
- **Tests:**
  - **Structure:** each page is up to date, not indexed, loads nothing, and runs no script. There's exactly one bar, a segment per phase each opening its matching panel, no cards, the no-script rule, `dir` per language, no internal references, and public wording in both languages.
  - **Browser, both pages:** with JavaScript on, no panel shows; a segment opens its own panel; clicking elsewhere and Close each dismiss it. With JavaScript off, every panel is visible in order.
- **Checked by eye:** desktop and phone, light and dark, English and Arabic, with JavaScript off. The check caught a real bug: the stitched fills had the background colour as the first layer, which is invalid, so complete segments rendered blank. Fixed.

### D-059 In Arabic, the name is always يافع

Owner, 2026-09-24, verbatim: "its always يافع nothing else in arabic". The Arabic portal name on the progress page had يافا, now corrected to «بوابة لجان المجلس العام ليافع في المملكة المتحدة». `tests/structure/arabic-name.test.ts` fails if any other spelling appears in the Arabic sources: `src/web/text/ar/`, the phase reports, `docs/progress-page-text.md` and `docs/current-work.md`.

### D-060 Three checks prove the progress page keeps up, ending with the page a visitor actually sees

Owner, 2026-09-24: asked for proof rather than assurance. Is the live page current, and what guarantees `docs/` itself isn't behind the work? The answer given: only the "Now" line and timestamp were forced to move, and only by a local hook; nothing tied the Built/Left lists to code, and nothing checked the live page. The owner approved all three proposed checks ("the third one matters most … the only one that proves what I actually see is current") and asked for one deliberate failure of each.

**Built** (`scripts/progress-checks/`, wired into `.github/workflows/ci.yml`):
1. **`check:now-lines`** (verify job): every commit in the push must change both "Now" lines in `docs/current-work.md`. This is the server-side twin of the pre-commit hook, so a bypassed hook (`--no-verify`) or a commit made elsewhere is caught.
2. **`check:summary-moves`** (verify job): every commit in the push that changes `src/` or `migrations/` must also change the current phase's public summary (Built, Left or Pending), with the current phase read from CLAUDE.md at that commit.
3. **`check:live-page`** (deploy job, after the deploy): fetches the live `/progress.html` and `/progress.ar.html`, with a unique query string to get past any cache, and requires each to equal byte for byte what this commit built. It retries 6 times, 10 seconds apart, while the new version spreads, then fails, naming both timestamps.

The verify job checks out the full history (`fetch-depth: 0`) and runs checks 1 and 2 over `github.event.before..github.sha`. `tests/structure/progress-checks.test.ts` tests all three against a real throwaway git repository and a stubbed fetch.

**Remaining limit, stated plainly:** no check can prove the wording is true. Check 2 makes the summary move with the code, and each change is visible in its commit.

### D-061 "Not linked" means the Clerk account was deleted after being linked

Question raised 2026-09-24 while starting 4f: brief 25 A2 lists the account state "Not linked" without defining it. Owner, choosing from three options: "Clerk account removed". The person was linked to a Clerk account, and that account was deleted, leaving the record in place and unlinked (brief 6.2).

### D-062 Loading the seed files never sends an invitation; sending needs the owner's go-ahead

Owner, 2026-09-24: "when the seed files load, real emails go out. Before that happens, tell me exactly who will receive one and when, and make sure nothing sends without me knowing." Rule, set before any seed loader exists:
- **Loading sends nothing.** The seed loader never invites anyone.
- **Listing:** a separate command then lists exactly who would be invited (name and email, from `seed/people.csv`), and sends nothing.
- **Sending:** needs a second, explicit run with a confirmation flag, done only after the owner has seen the list and said yes.
- **Enforced by test:** a test will fail if the seed loader can reach the invitation sender.

The only other paths that send email are an officer's deliberate actions: a register officer adding a new officer (brief 6.2), and an administrator resending (25 A2).

### D-064 The phase in progress shows no fill level

Owner, 2026-09-24: Phase 1's segment was split, pale above solid, and nothing said which part meant done; it read as most of the phase complete; and "1 of 13 phases complete" disagreed with a part-filled bar. Checked on the page itself: the split was a fixed 62%, written into the stylesheet as decoration and calculated from nothing. It showed 62% for any phase in progress. That was misleading, and a hard-coded value dressed as data. Counting summary items (built ÷ built + left) was considered and rejected: the items are very uneven in size, so it would read about 80% for Phase 1 and mislead as much.

**Fixed:**
- **The segment:** the phase in progress is an even madder cross-stitch over a madder tint, in a tacked madder outline, the same all over, with no fill level.
- **The legend:** its "In progress" swatch is identical to the segment.
- **The tally:** now reads "1 of 13 phases complete · Phase 1 in progress", in both languages, from `docs/progress-page-text.md` (`tallyCurrent`).
- **A test** fails if the in-progress segment ever gets a directional fill again.

### D-063 A daily job locks accounts on the date their last term ends (resolves O-025)

Owner, 2026-09-24: "O-025: (a) add the daily job. A term ending on a future date should lock the account on that date, not whenever someone next touches it. Add it to the scheduled jobs and record it."

**Built:**
- **The job:** `lock-accounts-after-last-term` (`src/worker/cron/lock-accounts-after-last-term.ts`), registered at Worker start (`registerCronJobs`).
- **Who it locks:** everyone with a linked, unlocked account who has held a term that has ended by today (London date) and holds no current term and no term starting later.
- **The setting still governs it:** unset means nothing locks.
- **Failures:** if Clerk fails for one person, it tries the rest, then fails the run so the job record shows it.
- **Audit:** its locks name `scheduled-job:lock-accounts-after-last-term` as the actor.
- **The immediate lock (T-087)** now uses the same query, which also fixes a gap: it ignored a term starting later.

**Schedule: `15 0 * * *` (00:15 UTC).** This time is Claude Code's choice, for the owner to confirm or change. It is just after midnight London time in both GMT and BST, so a term ending on a date is locked early that day. It is added to `triggers.crons` and to `vars.CRON_JOBS` in every environment, extending D-001's table, and like the others it lives in `wrangler.jsonc`, since cron times can't change at runtime.

**Tests:** nothing locks with the setting unset. With it on, only the right account locks, and not someone with a term starting later, still serving, unlinked or already locked. The job is registered under the name the schedule maps to.

### D-065 The daily lock job's time, 00:15 UTC, is confirmed

Owner, 2026-09-24: "Job time 00:15 UTC is fine." (D-063.)

### D-066 Elections: seats, dates, locking and statuses

Owner, 2026-09-24, verbatim:
1. "Seats: a position can have several seats. Each seat is filled by a candidate."
2. "Outgoing terms end the day before the new terms start, so there's no gap and no overlap."
3. "New terms start on a start date entered at confirmation, defaulting to the election date. Some committees take office later than the vote."
4. "A confirmed election is locked. Results can never be changed. A correction is a new election record referring to it, and the register is put right by ending and starting terms directly."
5. "'Draft' and 'Confirmed' are right. Use those."

Order of work: "Start with the lists, handovers, the access check and the set-up checklist while you record these, then build elections."

### D-067 Handovers: the whole checklist confirmed once by each officer; items fixed once confirmation starts, locked when complete

Question raised 2026-09-24 while starting handovers (brief 14 C2: "confirmed by both"; build notes: "each confirmation records who and when"). Owner, choosing from the options offered:
- **"The whole list, once each."** Items are ticked off as a working list; then the outgoing and the incoming officer each confirm the whole handover once, and each confirmation records who and when.
- **"Add/remove; lock when done."** Items can be added or removed for that one handover until confirmation starts. Once complete, it is locked and never changes.

### D-068 Outgoing terms end on the new terms' start date (no gap, no overlap, D-029 unchanged)

Raised 2026-09-24: D-029 says powers "end on the end date", so an officer no longer holds office on their end date, while D-066 says outgoing terms "end the day before the new terms start, so there's no gap and no overlap". Taken literally together, that leaves a one-day gap. Owner, choosing from three options: **"S (new start date)"**. When an election is confirmed with new terms starting on day S, the outgoing terms get the end date S. Outgoing officers hold office up to and including S−1, and the new officers from S. D-029 stands as it is.

### D-069 The public progress page is removed

Owner, 2026-09-24, verbatim: "when reaching natural stop ,, just remove the progress web page and its redirections ,, we don't need it anymore". Done on 2026-09-25, after the pause the owner asked for. Everything that existed only for the page was removed:
- `/progress.html` and `/progress.ar.html`, their routes, and the preview's root pointing at the page (D-047: the `ROOT_SHOWS_PROGRESS_PAGE` setting and the `/portal` route its link used). `/` serves the portal everywhere again.
- The `public-progress-page` access class and its sweep entries.
- The generator (`scripts/progress-page/`), `docs/progress-page-text.md` and `docs/current-work.md`.
- The pre-commit hook (`.githooks/pre-commit`, the `prepare` script and the local `core.hooksPath`), and the three CI checks of D-060 (`scripts/progress-checks/`).
- The "Progress summary (public)" sections of the phase reports.
- Their tests, and CLAUDE.md's definition-of-done lines about the page.

D-040, D-045, D-047, D-056 to D-058, D-060 and D-064 stay above as history; this entry supersedes them. `assets.html_handling: "none"` stays: it is a sound general rule, a file served only at its exact path.

### D-070 List items are never deleted; they are retired (answers O-026)

Owner, 2026-09-25: "a list item is never deleted. It's hidden from new choices and kept so past records still read correctly."

### D-071 The administrator sets the order of list items, and of roles (answers O-027)

Owner, 2026-09-25: "the administrator sets the order. Event types and roles have a natural order that isn't alphabetical." Built for the five lists (and the calendar colours, D-076) on the Lists screen. Standard roles are ordered on the Roles screen by whoever maintains them, the national register officer. Reading "and roles" as covering them is my interpretation, listed in the phase report.

### D-072 The admin area opens for anyone holding an administration capability (answers O-028)

Owner, 2026-09-25: "this is a bug against the brief, not a choice. The admin area is visible to anyone holding at least one administration capability (brief 25, build notes), and units and standard roles are the national register officer's powers (brief 25, rules). Fix it so the admin area opens for anyone with an administration capability, showing only the screens they hold." Confirmed the same day: the proof is a test that a national register officer who isn't a system administrator can open the admin area and sees only Units and Roles. Supersedes D-021's "Administration-panel capability" reading.

### D-073 "Branches may add extra roles" is set on the Roles screen, by the national register officer (answers O-029)

Owner, 2026-09-25: "the Roles screen, by the national register officer. That's what brief 25 B2 says."

### D-074 The set-up checklist sets required settings (answers O-030)

Owner, 2026-09-25: "let the set-up checklist set required settings. It already exists in Phase 1 and already knows what's unconfigured. Don't wait for Phase 2 and don't put settings in the seed files."

### D-075 The first people are invited from Clerk's dashboard (answers O-031)

Owner, 2026-09-25: "(b) invite the first people from Clerk's dashboard. It's a handful of people once, and it keeps the secret key out of commands I type." No sending command is built. The portal links each account by email at sign-up (brief 6.2).

### D-076 Letterhead address in two languages; calendar colours from a list (answers O-032)

Owner, 2026-09-25: "the letterhead address is written in both English and Arabic, same as names. The calendar colour is chosen from a set you define, so branches stay distinguishable." Confirmed the same day, after I noted a set written in code would break rule 2: "(a) the colour set is a list the data administrator manages on the Lists screen, like the other lists."

### D-077 Three of my Phase 1 choices kept

Owner, 2026-09-25: "Your three choices — whole days, the confirmation tick box, and the 'Handovers you take part in' page — are all right. Keep them." (T-100, T-105, T-106, T-107.)

## Technical decisions (made by Claude Code)

### T-001 Package versions

Chosen from the npm registry on 2026-09-20 and checked against peer requirements:

- Runtime, Worker: hono ^4.13.8, drizzle-orm ^0.45.2, zod ^4.6.5, @clerk/backend ^3.18.1, @cloudflare/puppeteer ^1.4.0, aws4fetch ^1.0.20, @block65/webcrypto-web-push ^2.0.0.
- Runtime, browser: react and react-dom ^19.3.0, react-router ^8.4.0, @tanstack/react-query ^5.103.1, @clerk/react ^6.16.1, and @clerk/localizations ^4.17.1 (Clerk's Arabic sign-in screens, brief section 8.5; shown to the owner before install as they asked).
- Pins that are not "latest": TypeScript ~6.0.3 (typescript-eslint requires below 6.1; 7.0.2 is out), Vitest ^4.1 (Cloudflare's test plugin requires 4.1 or later; 5.0.1 is out), @types/node ^24 (matches the Node 24 used locally and in CI).

### T-002 Test plugin package name

`@cloudflare/vitest-plugin` is used instead of the `@cloudflare/vitest-pool-workers` named in the brief. Cloudflare renamed it on 2026-08-19; the API is unchanged. Approved with the list (D-014).

### T-003 Webhook verification

Clerk webhook signatures are verified with `verifyWebhook` from `@clerk/backend/webhooks`, which checks the Svix signature headers. The `svix` package is not added. Approved with the list (D-014).

### T-004 Reading of "every dependency must run on Workers"

Applied to everything bundled into the Worker. Build, test and lint tools run in Node and are never deployed. Approved with the list (D-014).

### T-005 Deliberately not added

`@clerk/clerk-react` (deprecated, replaced by `@clerk/react`), `@clerk/ui`, `@clerk/testing` (deferred until a phase has journeys to sign into), `@cloudflare/workers-types` (types come from `wrangler types`), the Node `web-push` package, ULID, date and money libraries (small in-house modules), any i18n runtime or RTL plugin (brief section 8.5 prescribes the text structure and Tailwind 4 has logical utilities), `vite-plugin-pwa`, `@hono/zod-validator`, and font files (fonts come from branding in Phase 2).

### T-006 Content Security Policy

Brief section 12 asks for a strict policy with "own origin plus Clerk's domains only". Clerk documents that its components need `style-src 'unsafe-inline'`, and that it needs its Frontend API host, `img.clerk.com`, `*.protect.clerk.com` and `challenges.cloudflare.com` (bot protection). Those are the only relaxations. The Frontend API host is derived from the Clerk publishable key at run time, so no instance-specific host is written in the code.

### Planned technical decisions (decided on 2026-09-20, not yet built)

These were decided while planning Phase 0. They are recorded now so the next session does not re-derive them. Change them freely if the build shows a problem, and update this file when you do.

- **T-007 Test layout.** Three Vitest projects: `worker` (runs in workerd through Cloudflare's plugin; `tests/core`, `tests/middleware`, `tests/api`, `tests/permissions`, `tests/integrity`), `web` (jsdom; `tests/web`) and `structure` (plain Node; `tests/structure`, for lint-rule tests, file-size and naming checks, wrangler config checks and the text-key parity test). The Workers plugin does not support custom environments, which is why the web tests need their own project. Playwright lives in `tests/e2e`.
- **T-008 Size limits.** ESLint `max-lines` is an error at 300, `max-lines-per-function` is 50, and 150 for `.tsx` components. Test files get 400 lines, and 400 per function because the outer `describe` callback wraps the whole file (brief section 5.2 allows 400-line tests). A structure test also fails any source file over 250 lines. Generated files are excluded.
- **T-009 Right-to-left lint.** Brief section 28 says logical CSS properties only. An ESLint rule bans physical-direction Tailwind classes (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right`, `rounded-l`, `rounded-r` and similar) in `src/web`.
- **T-010 Wrangler layout.** The top level is for local development and tests. `env.preview` and `env.production` redeclare every binding (Wrangler does not inherit them). Compatibility date is the latest one the installed workerd supports (2026-09-18 at the time of writing), with `nodejs_compat` (Browser Rendering requires it). Assets use the single-page-app fallback with `run_worker_first` for `/api/*` and `/manifest.webmanifest`. Observability is on with the sampling rate left unset. Cron schedules come from D-001; the map from cron expression to job name lives in `vars.CRON_JOBS` in `wrangler.jsonc`, and a structure test checks it matches `triggers.crons`, so no schedule is written in code. The production D1 `database_id` stays an obviously invalid marker until Phase 12, so an accidental deploy cannot auto-create a database without the EU jurisdiction.
- **T-011 Generated types.** `wrangler types` generates the `Env` type. Secrets have no value in CI, so their names come from a committed `.dev.vars.example` (names only, no values). The generated file is git-ignored and regenerated by the `typecheck` script.
- **T-012 Package basics.** Package name `yafa-portal` (matches D-008), npm, Node 24 or later.
- **T-013 Origin rule.** "API accepts requests only from the portal's origin" is done without CORS headers: any request whose `Origin` header differs from the request URL's own origin is rejected.
- **T-014 Fonts.** Until Phase 2 supplies fonts from branding, the interface uses the platform's own fonts, which cover Arabic and Latin. No font file is bundled and nothing is loaded from outside.
- **T-015 Service worker.** Phase 0 registers a service worker with the install and activate lifecycle only. Push and notification-click handling arrive with the notification kinds in Phase 7, because the push text is defined there.
- **T-016 Dispatchers.** Phase 0 builds the scheduled-job and queue dispatchers (including recording each job's last run and outcome, brief section 11) with empty registries. Job and consumer files arrive in the phase that owns each one.
- **T-017 Formatting.** Date and money formatting lives in `src/shared/core/` so the browser and the PDF code share it. Money is passed to `Intl` as an exact decimal string built from integer pence, never as a float. Locale tags: English `en-GB`, Arabic `ar`. The Arabic digits setting, when unset, passes no numbering system, so the browser's own default applies.
- **T-018 Errors.** The API returns error codes, never prose. The web app maps a code to text from `src/web/text/`, in the officer's language. The "not configured" sentence from brief section 8.1 is one of those texts.
- **T-019 Two settings registered in Phase 0**, both in `administration-panel/settings.ts` with no default: `administration-panel.new_officer_language` (required, because creating an officer needs it) and `administration-panel.arabic_digits` (not required). Real settings are registered by the phase that first uses them; the core modules take their limits as parameters.
- **T-020 Immutable text versions.** Privacy notice and other admin-edited texts are stored as append-only versions (English and Arabic together), protected by a trigger, because an acknowledgement records which version the officer saw (D-005).
- **T-021 System administrators.** Stored as a table of person ids (`system_administrators`), because brief section 25 A1 appoints and removes them as a list. Phase 1 builds appoint and remove.
- **T-022 Corrected compatibility date.** T-010 guessed `2026-09-18` from wrangler 4.135.0's bundled workerd before either was installed. The versions actually installed on 2026-09-22 are wrangler 4.136.3 / workerd 1.20260921.1, confirmed by reading `node_modules/workerd/package.json` after `npm install`. `wrangler.jsonc`'s `compatibility_date` is `2026-09-21`. Re-check this the same way (never guess from a registry lookup alone) whenever dependencies are next updated.
- **T-023 `@cloudflare/vitest-plugin` actual API (corrects T-002).** T-002 assumed the API was unchanged from `@cloudflare/vitest-pool-workers`. It is not: the old `defineWorkersConfig`/`defineWorkersProject` wrapper functions do not exist in this package. The real API is a Vite plugin: `import { cloudflareTest } from '@cloudflare/vitest-plugin'`, added to a normal `defineConfig({ plugins: [cloudflareTest({ wrangler: { configPath } })] })` from `vitest/config`. Confirmed by reading the installed package's type declarations and Cloudflare's current docs. `readD1Migrations` is exported from the npm package (Node-side, for a vitest setup file); `applyD1Migrations` is exported from the ambient `cloudflare:test` module instead (worker-side, inside test code) — the draft report's note that these two were both in the npm package was wrong.
- **T-024 Dev tooling: exact versions and two additions not in the original T-001 list.** Resolved against the npm registry on 2026-09-22: `typescript-eslint` ^8.70.1 (combined parser+plugin package, not separate `@typescript-eslint/*` packages), `eslint` ^10.11.0, `@eslint/js` ^10.0.1 (needed separately for `js.configs.recommended`; its version line trails `eslint`'s), `eslint-config-prettier` ^10.1.8, `eslint-plugin-boundaries` ^7.2.0, `eslint-plugin-react-hooks` ^7.1.1, `eslint-plugin-react-refresh` ^0.5.7, `globals` ^17.12.0, `prettier` ^3.9.8, `vite` ^8.3.0, `@vitejs/plugin-react` ^6.1.1, `vitest` ^4.1.11, `@cloudflare/vitest-plugin` ^1.2.3, `wrangler` ^4.136.3, `drizzle-kit` ^0.31.11, `@playwright/test` ^1.63.0, `tailwindcss` ^4.3.3, `@tailwindcss/vite` ^4.3.3. Two additions beyond the original list: **`jsdom`** ^30.1.1 (dev-only, the `web` Vitest project's DOM environment — Vitest doesn't bundle one) and **`@cloudflare/vite-plugin`** ^1.57.3 (dev/build-only; the officially recommended way to serve the Hono Worker and the React SPA from one Vite dev server per the brief's "one Worker serves the API and the frontend through Workers Static Assets" architecture, avoiding a hand-rolled `vite build --watch` + `wrangler dev` combination). Both are Node-only build/test tooling, never bundled into the Worker (T-004 exemption).
- **T-025 `eslint-plugin-boundaries` tried, then dropped entirely for a plain `no-restricted-imports` scheme.** The draft report flagged this plugin as untried on ESLint 10 flat config, with `no-restricted-imports` as the documented fallback. It was tried directly and thoroughly — not just "does it load without a config error," but "does it actually reject a deliberately-wrong deep import" — and needed two rounds of fixing before that was true, found each time by temporarily instrumenting the installed rule with `console.error` (reverted immediately after) rather than guessing further from the plugin's docs, which had already proven unreliable once (T-023). First bug: `target: ['core', 'service']` is a "legacy selector" whose compat shim silently produces no match; needed the object form `target: { element: { type: [...] } }`. Second bug, found after the first fix made a service→core violation correctly fail: `eslint-import-resolver-node` only tries `.js`/`.json`/`.node` by default, so every extension-less `.ts` import failed to resolve and the rule silently skipped every real file; fixed with `settings['import/resolver'] = { node: { extensions: [...'.ts', '.tsx'] } }`. With both fixed, a **third** problem surfaced that had no fix found in reasonable time: `dependency.to.element.fileInternalPath` came back as the full repo-relative path (e.g. `src/worker/core/ids/index.ts`) instead of a path relative to the element's own root (`index.ts`), so `allow: 'index.ts'` could never match *anything* — meaning the rule had actually been rejecting every cross-module import unconditionally, including correct ones through `index.ts`; this had gone unnoticed because the only classified-source case tested so far (service → core) happened to be a rejection either way. Given a real, unresolved false-positive at that point, **the plugin was removed entirely** (`npm uninstall eslint-plugin-boundaries`) rather than shipped half-working. All four module-boundary rules — core never imports a service, core/service import another core module only via its `index.ts`, routes never import a repo directly, web never imports worker code — are now plain `no-restricted-imports` `patterns`, each individually verified to both catch a deliberate violation and pass legitimate code (see T-036 for one further glob-matching surprise found doing that verification).
- **T-033 `NATIONAL_SCOPE` is a structural constant, not a setting.** `src/shared/core/national-scope.ts` exports `NATIONAL_SCOPE = '__national__'`, the sentinel `settings.scope`/`service_switches.scope` use for "the portal-wide value" (as opposed to a real unit id, for a per-unit override). This looks like the hard-coded value rule 2 forbids, but it isn't configuration — it's a fixed discriminator the schema and code need to tell "no unit override" apart from "a unit id happens to be missing," the same way a NULL sentinel would be, chosen as a real string instead of NULL specifically to keep `(key, scope)` a plain two-column composite primary key (SQLite treats NULLs as distinct from each other in uniqueness checks, which would silently allow duplicate "national" rows for the same key). Recorded here so Phase 12's hard-coding review doesn't flag it without this context.
- **T-034 Settings/service-switches writes use raw D1 prepared statements in `db.batch()`, not Drizzle's query builder.** Reads use `drizzle-orm/d1`'s typed `select()`. Writes need an atomic "capture the old value, then upsert, then audit" batch (brief section 8.1/9.1: history's previous value comes from SQL, never read-then-written in TypeScript) via a scalar subquery — `INSERT INTO settings_history (...) VALUES (?, ?, ?, (SELECT value FROM settings WHERE key = ? AND scope = ?), ...)`, which returns `NULL` for a key's first-ever value and the prior value otherwise, in one statement. Drizzle's builder doesn't cleanly express a scalar subquery as a column value, so the batch's three statements (history insert, `settings` upsert via `ON CONFLICT ... DO UPDATE`, audit insert) are built as raw `D1Database.prepare().bind()` and passed to `db.batch([...])` directly. Drizzle's schema definitions are still the source of truth for the tables and for `drizzle-kit generate`'s migrations.
- **T-035 `settings_history` and `audit_log` don't use ULID ids.** Brief section 9.1 says "IDs are ULIDs as text," but a SQLite trigger can't call the JS `generateId()`, and generating the id in TypeScript before the SQL-side history capture (T-034) would defeat the "logic that depends on current data is done in SQL" rule if the trigger approach were used instead — so a trigger-based history-copy was considered and rejected. `settings_history` does use a `generateId()` text id (generated in application code, before the batch — no conflict there, since ITS id doesn't depend on current data). `audit_log` likewise uses a `generateId()` id via `buildAuditStatement()`. Neither uses SQLite's implicit rowid; both follow the "IDs are ULIDs" rule as stated.
- **T-036 The twelve stage-one services (`src/shared/core/services.ts`) are a fixed code constant, not administrator-configurable data.** Names and numbering taken verbatim from brief section 3.1's table (including its gaps — 10, 11, 14, 16 are genuinely absent, not a typo). This is the *set of services that exist*, which is fixed by what's been built (rule 3: build only what the brief describes); the data administrator only controls whether an *existing* service is switched on or off (brief section 8.4), which is what `service_switches` stores.
- **T-037 A `no-restricted-imports` `group` pattern is not anchored to the full specifier string.** Found verifying T-025's replacement rules: a pattern like `../[!.]*/*`, written expecting to match only a 3-segment specifier (`../ids/generate-id`), also matched a 6-segment, unrelated one (`../../../shared/core/national-scope`) — it behaves more like "matches somewhere in the path," not "matches the whole path." Fixed by only using patterns anchored on a distinctive literal substring that can't appear by coincidence (`**/services/**`, `**/core/*/*`, `**/*.repo`, `**/worker/**`) rather than leading-wildcard shapes; the general "any core module's sibling, from within core" case was dropped rather than risk another silent false-positive or false-negative (tracked as a gap — see the Phase 0 report). Also found while wiring this up: ESLint flat config replaces a rule's *entire* option value for the last matching block, it does not merge arrays — two blocks both setting `no-restricted-imports` for overlapping `files` globs (`src/worker/services/**/*.ts` and `src/worker/services/*/**/*.routes.ts`) meant the more specific block silently dropped the general one's patterns for `.routes.ts` files, until fixed by repeating the shared pattern explicitly in both blocks.
- **T-026 Three separate `tsc --noEmit` runs, not TS build-mode project references.** `tsconfig.worker.json` / `tsconfig.web.json` / `tsconfig.node.json` are checked independently (`npm run typecheck`), not via a root `tsconfig.json` with `references` and `tsc -b` — build mode needs `composite: true`, which requires declaration emit, conflicting with the plain `noEmit` type-check-only setup wanted here. `tsconfig.web.json` is deliberately left out of `eslint.config.js`'s type-aware `parserOptions.project` array until `src/web` has real files: a TS project with zero matching inputs fails to build at all (`TS18003`), which breaks linting for every file, not just web ones. Add it back the moment the frontend shell starts.
- **T-027 `wrangler.jsonc` and `wrangler types` started earlier than the step-7 plan, minimally.** The resume-plan order of work put `wrangler.jsonc` at step 7. In practice the `worker` Vitest project (T-007) needs a wrangler config to boot `cloudflareTest()` at all, and any worker-side TypeScript needs the ambient runtime globals (`crypto`, `Request`, `Response`, …) that only `wrangler types` generates into `worker-configuration.d.ts` — needed even before any binding exists. `wrangler.jsonc` currently has only `name`, `compatibility_date` and `compatibility_flags`; D1, R2, Queues, static assets, cron triggers and `env.preview`/`env.production` are still added at step 7, once the worker entry point and the bindings they serve actually exist. `worker-configuration.d.ts` is generated, git-ignored, and included only in `tsconfig.worker.json`.
- **T-028 `ids` module: simplified (non-bit-exact) ULID randomness encoding.** `generateId()` (`src/worker/core/ids/`) produces a 26-character, Crockford-base32, time-sortable id: 10 characters of base-32-encoded millisecond timestamp, then 16 characters each independently derived from one `crypto.getRandomValues()` byte via `% 32` (unbiased, since 256 is an exact multiple of 32). This differs from the official ULID spec's exact 80-bit slicing across byte boundaries, but is not spec-sensitive here: T-005 deliberately excluded an external ULID package, nothing decodes these ids with a third-party ULID library, and the properties that matter (fixed 26-char Crockford output, unique, sortable by generation time) are covered by `tests/core/ids/generate-id.test.ts`.
- **T-029 Prettier scope.** `.prettierignore` excludes all `*.md` files and `.claude/` — hand-maintained prose (the brief, `CLAUDE.md`, `docs/`) and the owner's own permission config are not code-style targets; running Prettier over them risked mangling tables/formatting the owner controls.
- **T-031 Route registry + permission sweep, structural half only.** `src/worker/core/permissions/` (`route-access.schema.ts`, `route-registry.ts`) implements D-004's four fixed access classes as a Zod discriminated union (`capability` — validated against `<service>.<resource>.<action>`, brief section 5.1 — `signed-in-only`, `signed-webhook`, `calendar-feed-token`); `registerRoute()` validates and records a declaration, rejecting duplicates. `tests/permissions/route-sweep.test.ts` proves this against fixture routes (brief section 7.4: "the machinery is proved with fixture routes", since no real routes exist yet), and now genuinely passes rather than reporting "no test files found". This is the **structural** half only ("every route declares one of the fixed classes; a capability is well-formed"). The **behavioural** half (sign in as Branch A, attempt Branch B's records; branch officer attempts a national action; administrator attempts to read content; every attempt fails 403/404) needs the request-context loader and `can()`, which need `people`/`terms`/`roles`/`permission_grants` — not built this pass (kept out deliberately, see T-032/T-033). Not a placeholder: `registerRoute`/`listRegisteredRoutes` are the real mechanism every future route file calls.
- **T-032 GitHub Actions CI, verify job only.** `.github/workflows/ci.yml` runs on every push: install, `wrangler types`, typecheck, lint, format check, tests, permission sweep — all fully self-contained, no secrets or Cloudflare/Clerk credentials needed (`wrangler types` only reads the local `wrangler.jsonc` plus the installed `workerd` version; no network call). The deploy-preview job is deliberately not added yet: it needs `vite.config.ts` (order-of-work step 6), a full `wrangler.jsonc` with `env.preview`/D1/R2/Queues/assets (step 7), and the created preview resources (step 8) — none of which exist. Adding it now would guarantee a red job on every push, which is worse than the gap being visible in the phase report.
- **T-030 `@cloudflare/puppeteer`'s transitive advisory, not remediated.** `npm audit` reports a high-severity symlink-traversal advisory in `extract-zip`, pulled in transitively via `@cloudflare/puppeteer` → `@puppeteer/browsers`. That chain is only used to download/extract a local Chromium binary for local Puppeteer use; the approved runtime path (T-001) is Cloudflare's server-side Browser Rendering binding, which doesn't go through it. Not running `npm audit fix --force`, since that would silently move off the approved pinned version (D-014) without asking. Re-check when `core/pdf` is actually built.
- **T-038 `system_administrators` (T-021) built now, minimally, alongside `people`/`terms`/`roles`/`permission_grants`.** The request context (brief section 6.3) includes `isSystemAdmin`, which `core/permissions`' context loader needs this session even though the appoint/remove screen (15 A1) is Phase 1. T-021 had already fixed the table's shape (person ids only); building the empty table now is the same "minimum columns now, feature later" move D-003 already applies to the identity tables, not a new modelling decision. No row is ever seeded into it this session — Phase 0 loads no seed data at all (owner inputs for people are needed by Phase 1 seed per section 30).
- **T-039 Capability catalogue starts empty in Phase 0.** `src/worker/core/permissions/capability-catalogue.ts` follows `settings-registry.ts`'s register/get/list/reset-for-tests pattern exactly (brief section 7.2: catalogue entries carry a meaning and their allowed scopes). No real capability is registered by this session's code, because no route that would own one exists yet (the route-sweep fixtures are fixtures, not real routes, same reasoning as T-031). Tests that exercise `can()` register their own throwaway capabilities via `registerCapability()`/`resetCapabilityCatalogueForTests()`, exactly as the settings tests do for settings. `can()` throws on a capability that isn't in the catalogue, mirroring `getSetting`'s behaviour for an unregistered setting key — an uncatalogued capability is a code bug (a typo), not a "deny," and must not fail silently closed in a way that looks like a working permission check.
- **T-040 Term currency (D-019) implemented as one SQL predicate, dates compared against "today" in Europe/London, date granularity only.** D-019 defines the `end_date` half of currency; D-029 (2026-09-22) settled the `start_date` half the initial version of this entry had only guessed at — see D-029, which corrects that guess. The query filters `start_date <= :today AND (end_date IS NULL OR end_date > :today)`, where `:today` is a `YYYY-MM-DD` string (matching `start_date`/`end_date`'s own granularity — these are calendar dates an officer enters, not timestamps) computed via `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' })`. **Which civil timezone "today" uses** remains this entry's own technical/internal call, not asked about: Europe/London was chosen because brief section 9.1 already fixes it as the display timezone for the whole portal and every officer is UK-based; UTC was rejected because it can put "today" a day ahead of the UK's actual calendar date for part of the evening.
- **T-041 Permission scope resolution (`own unit` / `all units` / `national content`, brief section 7.2) implemented as one pure function, `resolveScope()`, with its own unit tests.** Brief section 7.2 names the three scopes but does not define their comparison rules; section 7.1 says the General Council "owns national content," which is a real `units` row (`type = 'national'`), so `national content` is read as: the grant applies when the requested `unitId` equals that row's id (content owned by the national unit is unit-scoped data like any other, just owned by the national unit specifically) — not the settings-only `NATIONAL_SCOPE` sentinel (T-033), which is explicitly "not a real unit id" and is a different concept entirely. `own unit` requires the requested `unitId` to equal the specific term's own `unitId` (not any of the person's other current terms — see the cross-unit leak this closes, next entry). `all units` matches any requested `unitId` unconditionally, including the national unit's, since "all" is read as inclusive of every unit row without exception. Confirmed by the owner as exactly this reading (D-028, 2026-09-22): this is no longer a guess.
- **T-042 `can()` never trusts a pre-resolved, flat "capabilities" set; it re-queries `permission_grants` joined to `terms` by `(personId, capability, today)` on every call, and evaluates `resolveScope()` per matching row against the requested `unitId`.** The request-context object's own `capabilities` field (brief section 6.3's literal shape) is populated from the same join but flattened across *all* of a person's current terms with no `unitId` attached — kept only as a coarse "does this person hold this capability anywhere" UI hint (e.g. whether to show a nav item at all), and is documented as non-authoritative in its own file. Using it for an actual authorization decision would leak: a person who is Treasurer in Branch A and Secretary in Branch B would appear to hold Treasurer's capabilities when acting in Branch B if the check only tested set membership without also checking which unit granted it. `can()` is the only authoritative check; it takes `ctx.personId` and re-derives everything else itself. Nothing about permissions is cached between requests (brief section 6.3), consistent with this.
- **T-043 Database placement for the new tables follows the existing split, not service ownership.** `people`, `terms`, `roles` go under `src/db/schema/committee-register/` (brief section 14's Build notes list these as that service's tables; `units.ts` already lives there under the same D-003 minimal-columns reasoning). `permission_grants` and `system_administrators` go under `src/db/schema/core/`, alongside `settings`/`service_switches`/`audit_log` — all four are core-module concerns (read and written by `core/permissions`, `core/settings`, `core/service-switches`, `core/audit` respectively) that happen to be *surfaced* through the Administration panel (service 15) later, not owned by a service the way `units`/`people`/`terms`/`roles` are owned by the Committee register. The query code that reads `people`/`terms`/`roles` for context-loading and `can()` lives entirely inside `src/worker/core/permissions/` for the same reason `core/settings`/`core/service-switches` hold their own repos: it is the only consumer that exists yet. When Phase 1 builds the real Committee register service (officers, elections, handovers), its own repos query these same tables directly; nothing here is a placeholder for that work.
- **T-044 Permission scope enum values follow brief section 5.1's exact-label convention, not snake_case.** `src/shared/core/permission-scope.ts` exports `PermissionScope.OwnUnit = 'own unit'`, `.AllUnits = 'all units'`, `.NationalContent = 'national content'` — matching the `TaskStatus.InProgress = 'In progress'` example literally (PascalCase name, value is the exact label text from the document, spaces included), not the snake_case slugs `service_switches`/`settings` use for their own `scope` column (T-033's `NATIONAL_SCOPE`), which is a different, structural concept.
- **T-045 Core-to-core import boundary gap (T-037): owner confirmed 2026-09-22, verbatim, accept the gap** ("accept the gap. Add it to the Phase 0 report as a known limitation, and cover it in the Phase 12 security review instead"). No code or lint change made in response; the Phase 0 report keeps it listed as a known limitation, and it is added to the fixed Phase 12 scope (brief section 26: "written security review of every route") as a specific item to check by hand, since no automated rule catches it.
- **T-046 Two small items reconfirmed 2026-09-22, no change needed.** Git identity (`user.name "malsadi"`) was confirmed correct as already configured. The CI deploy-preview job's timing (T-032: wait for `vite.config.ts` and the full `wrangler.jsonc`) was reconfirmed as agreed, not changed.
- **T-047 `db:migrate:local` script fixed: named the wrong database.** Pre-existing bug, found while applying migration 0002 locally to verify it: `package.json`'s `db:migrate:local` targeted `yafa-portal-db`, but `wrangler.jsonc`'s local D1 binding is `yafa-portal-local-db` (T-027's local-only binding) — the two names never matched, so the script would have failed the first time anyone ran it. Fixed to `yafa-portal-local-db`; confirmed working by running it, which applied all three migrations (0000–0002) cleanly to `.wrangler/state/v3/d1`.
- **T-048 `can()` also filters a grant against its capability's own `allowedScopes`, not just against a matching row existing.** Found in review: the catalogue entry (T-039) records which scopes a capability may be granted at, but nothing had read that field back — a `permission_grants` row stored at a scope the catalogue doesn't allow for that capability (a bug in the Phase 1 matrix editor, since the matrix is data, not something this code writes) would silently pass `can()`. Fixed: `can()` filters `findGrantsForCapability`'s rows through `definition.allowedScopes.includes(grant.scope)` before evaluating any of them. Covered by a new test (`can.test.ts`: "ignores a grant stored at a scope the capability catalogue does not allow").
- **T-049 Email case handling: not yet built, ruled here for when it is.** `people.email` (T-043) is matched by the Clerk webhook (brief section 6.2, not built this session) to link an existing person record. Rule, for whoever builds the webhook and any future `findPersonByEmail`: every write compares/stores the email lowercased (Clerk emails aren't case-sensitive), so the webhook can't silently fail to link a person because of a casing difference between the register officer's typed email and Clerk's. Not applied to `people.email`'s existing unique index in migration 0002 — that migration has already been applied locally and CLAUDE.md forbids editing an applied migration; if a case-insensitive uniqueness guarantee at the database level is wanted later, add it as a new migration (`CREATE UNIQUE INDEX ... ON people (lower(email))`), which doesn't require rebuilding the table.
- **T-050 `national content` scope resolves against the *requested* unit's own `type`, not "the" national unit's id (corrects an earlier version of T-041's implementation).** The first cut fetched one `units` row with `type = 'national'` via `LIMIT 1` with no `ORDER BY` and compared ids — nondeterministic, and silently wrong, if the schema ever had more than one such row (nothing enforces exactly one). `isNationalUnit(db, unitId)` (`national-unit-repo.ts`) checks the specific requested unit directly instead, which is correct regardless of how many national-type units exist.
- **T-051 `core/errors` built (brief section 26 Phase 0; T-018).** `AppError` (a `code` and a Hono `ContentfulStatusCode`, never constructed directly) with three subclasses so the status is explicit at every throw site: `ForbiddenError` (403), `NotFoundError` (404, the default per brief section 7.4 wherever revealing existence would leak), `ConflictError` (409, for the stale-save case brief section 9.1 names). `handleAppError` is a Hono `ErrorHandler` — not yet wired to an app, since `src/worker/index.ts` doesn't exist yet; whoever builds it registers `app.onError(handleAppError)` once. It maps `AppError` to `{ error: { code } }` at the error's own status, a `ZodError` (route input validation) to `400`/`request.invalid`, and anything else to `500`/`server.error`, logging only the error's `name` — never its message, stack, or any request data (brief section 12: no personal data in logs). No error-code catalogue/registry (unlike settings/capabilities): codes are plain strings each call site chooses, since nothing validates them against admin-entered data the way settings/capabilities are.
- **T-052 `money`/`dates` formatting built in `src/shared/core/` (T-017), and `tests/shared/**` added to the `worker` Vitest project (it had no home in any project's `include` list until now).** `formatMoneyGBP(pence, locale)` builds an exact decimal string from integer pence by integer arithmetic (never a float division) and passes that string to `Intl.NumberFormat.format()` — confirmed empirically against workerd's own Intl implementation (not assumed from the ECMA-402 spec), including a large amount, a negative one (a reversing entry), and sub-pound amounts. `locale` is a complete BCP-47 tag the caller builds, including a `-u-nu-...` numbering-system extension when the Arabic-digits setting (unbuilt, O-007 remainder) is configured — found while testing that this workerd build's own default for plain `'ar'` is already Western digits, so the "browser's own default" T-017 promises is genuinely runtime-dependent, not something this function should assert or override. `formatDateLondon(isoDateTime, locale, options?)` always fixes `timeZone: 'Europe/London'` (brief section 9.1) and the locale, and passes through any other `Intl.DateTimeFormatOptions` unchanged — how much of the date to show is left to the caller, since no screen exists yet to say. **Deliberately not moved here:** `getTodayInLondon()` (`core/permissions`) stays where it is — it answers "what civil date is it right now" for term-currency logic (D-019/D-029), a worker-internal business-logic question, not a value being formatted for display; T-017's "so the browser and the PDF code share it" doesn't apply to it, since the browser has its own clock and never needs to ask the server what today's date is.
- **T-053 `core/security-headers` built (brief section 12; corrects/completes T-006).** `@clerk/shared` ^4.33.0 added as an explicit dependency (approved-list addition, T-014's pattern): it was already present transitively via `@clerk/backend`/`@clerk/react`, so nothing new actually gets bundled into the Worker, but its `parsePublishableKey` is what correctly decodes a publishable key's real per-instance Frontend API host — `@clerk/backend`'s own `fapiUrlFromPublishableKey`, which T-006 assumed would work, turns out to be built for Clerk's *proxy* feature and returns one of three generic constants (e.g. `frontend-api.clerk.dev`), not the actual host the Clerk JS SDK talks to directly in this portal's non-proxied setup — confirmed by reading `@clerk/backend`'s own source, not assumed. `buildContentSecurityPolicy()` re-fetched Clerk's CSP guide directly (2026-09-22, https://clerk.com/docs/guides/secure/best-practices/csp-headers) rather than trusting T-006's partial recollection, and found two directives T-006 didn't have: `worker-src 'self' blob:` and `form-action 'self'`, plus that `frame-src` needs Clerk's hosts too (T-006 only listed script/connect/img/style). `frame-ancestors 'none'` is added on top — this portal's own requirement (brief section 12), not part of Clerk's guide. `securityHeaders(publishableKey)` (a `MiddlewareHandler` factory, computed once, not per request) also sets `Strict-Transport-Security` (two years, `includeSubDomains`, `preload` — a common strict default, brief section 12 names HSTS without a `max-age`) and `Referrer-Policy: strict-origin-when-cross-origin` (OWASP-recommended strict default and the current browser default — brief section 12 says "strict referrer policy" without naming one). `requireSameOrigin` (T-013) rejects only an `Origin` header that's present and mismatched; an absent `Origin` (server-to-server calls, including Clerk's signed webhook) passes through, since T-013 only requires rejecting a *mismatch*. Neither middleware is wired to an app yet — `src/worker/index.ts` doesn't exist.
- **T-054 `core/maintenance-mode` built as operational state, not a setting (brief section 25 D6).** `maintenance_mode` isn't in brief section 25's settings list, and `core/settings` treats an unset value as "not configured" (the action waits, brief section 8.1) — wrong for a whole-portal read-only flag, which must default to *off*, not to "waiting." Modelled like `service_switches` instead: one row (`key` always `'portal'` — there's exactly one), no row meaning off, an audit entry on every change, no history table (nothing asked for "versioned and restorable" the way 15 A3's matrix is). `maintenanceModeGate(db)` refuses a mutating method (`POST`/`PUT`/`PATCH`/`DELETE`) with a new `ServiceUnavailableError` (503 — added to `core/errors`, since maintenance is temporary, not a permission problem) while the flag is on; `GET`/`HEAD`/`OPTIONS` always pass, and `isMaintenanceModeOn()` is readable on its own for the banner. **Not yet solved, by construction:** the route that switches maintenance mode *off* must never carry `maintenanceModeGate`, or the portal could never leave maintenance mode — there's no route to wire this to yet (15 D6 is Phase 12), so this is a documented requirement (in the middleware's own comment) for whoever builds that route, not something enforced in code today.
- **T-055 `core/events-bus` composes into the publisher's own `db.batch()` call, rather than executing reactions itself (brief section 10).** A handler returns `D1PreparedStatement[]` (or a promise of one) instead of writing anything — the same shape `buildAuditStatement` already uses — and `collectEventStatements(db, eventName, payload)` runs every handler registered for that event and flattens their statements into one array, which the publisher appends to its own batch alongside its own trigger statement. This is what "the reaction runs in the same D1 batch" (brief section 10) actually requires: a generic async emit where each handler does its own write couldn't give that guarantee, since D1 has no cross-statement transaction outside `batch()`. Proved, not just asserted: a test registers a handler whose statement collides on a primary key, batches it with an unrelated "publisher" insert, and confirms the publisher's insert never persisted either — D1's `batch()` is one implicit transaction, so one failing statement rolls back the whole batch. Event names are plain strings (no catalogue/registry validation, unlike capabilities/settings) — each service's own `events.ts` (not built; no services exist yet) will define and publish under them, and core never imports a service, so there is nothing here to validate names against. **Queue-routed effects (notifications, brief section 10.1) are explicitly not this module's job** — a service enqueues those itself; nothing about a Queue message can be part of a D1 batch, so routing them through the same registry would be misleading.
- **T-056 `core/files` scoped to `buildObjectKey()` only, as the resume plan already said, with a `sanitizeFileName()` split out for its own testing.** Section 26 names Phase 3 as the owner of `fileRecord()` and the shared file layer generally; nothing else in `core/files` (the `files` table, presigned upload/download, orphan clean-up) needs an R2 binding or a consumer that exists yet. `sanitizeFileName()` strips only what would break the R2 key itself — path separators (`/`, `\`, replaced with `-`, so they can't add extra "folders" to the key) and control characters — and never reduces a name to ASCII: officers type Arabic as well as English (brief section 8.5), and the object key embeds the name verbatim (brief section 9.3). It also caps the sanitized name to a byte budget (200 bytes, default) by dropping whole characters, never a raw byte, so a multi-byte character (Arabic script, an emoji) can't be cut in half. `buildObjectKey()` still throws if the *whole* key would exceed R2's own 1024-byte key limit (confirmed via Cloudflare's current docs, not recalled) — a second, independent check, since `unitCode`/`recordId`/`fileId` aren't sanitized or length-capped by this module and could in principle be long enough on their own.
- **T-057 `core/notifications` built as the in-portal inbox only (brief section 9.5), with the Web Push half deliberately left for a separate `core/push` (the directory tree, line 163/166, lists them as two folders; 9.5's "holds … the Web Push sender" and line 780's "push through `core/notifications`" are read as describing the two modules working together, not as one module).** Reconciling all three brief lines: `core/notifications` owns the inbox table and is the one a service or cron job calls to write an in-portal row; when push must also fire, the caller (a Queue consumer, since section 10.1 routes every push-worthy event through a Queue) calls `core/push`'s send primitive itself, in addition to `core/notifications` — services and cron jobs never import `core/push` directly for anything push-related, only `core/notifications` for the in-portal half. This session builds `core/notifications` only; `core/push` is not started (see the note below). Built: `notifications` table (`people`, minimal columns — D-003's pattern extended to a table with no identity/permissions role); `buildInPortalNotificationStatement()` (`db.batch()`-composable, same shape as `buildAuditStatement`/`collectEventStatements`'s handlers — proved by the same T-055 collision test, not just asserted); `listNotificationsForPerson()`/`markNotificationRead()`, both scoped by `personId` in the query itself (never checked afterwards) because brief section 9.5 makes this a personal inbox, not a unit-scoped record — build rule 1's "every query on unit data filters by unit scope" doesn't apply to a table that has no `unit_id` column to filter by. A composite index (`notifications_person_created_idx` on `person_id, created_at`) was added to migration 0004 before it was applied locally, since the inbox's one query is always `WHERE person_id = ? ORDER BY created_at DESC` and will scale with officer count. **Read/unread state (`read_at`, `markNotificationRead`) is an assumption, not stated anywhere in brief section 9.5 or section 4** — flagged rather than silently built past: see O-013. It was kept (not stripped back out) because it is minimal, additive schema that an "inbox" concept is very unlikely to ship without, the same reasoning D-003/T-038 already apply to other minimal-columns-now tables — but it is explicitly unconfirmed and listed for the owner, not treated as settled. **Addendum, added once `core/push` existed to check the boundary against (T-059):** line 780's "push through `core/notifications` and a Queue" holds specifically because the function a *service* calls to request a notification-with-push (not built yet — no service exists yet to call it) lives in `core/notifications`, not `core/push`. `core/push` is delivery plus subscription storage only, for the Queue *consumer* to call once a message is already on the queue; a service never imports `core/push` directly, matching this entry's own "services and cron jobs never import `core/push` directly" line above.
- **T-058 `core/pdf` feasibility check performed, not built this session — local Browser Rendering could not be proven working in this session's development environment.** Cloudflare's own docs (fetched 2026-09-23) confirm local development for Browser Rendering is a real, supported feature since 2025-07-22: `wrangler dev`/the `@cloudflare/vitest-plugin`'s Miniflare runtime can run `@cloudflare/puppeteer` against a locally-downloaded Chromium, with no remote call and no cost, as long as the code only uses Puppeteer/CDP methods (not the newer `.quickAction()` REST helpers, which do need `remote: true`). Tried directly, not assumed: a `browser: { binding: "BROWSER" }` entry added to `wrangler.jsonc` (spike only, since removed — no resource created, same as any other top-level dev binding, T-027's precedent) and a throwaway test that calls `puppeteer.launch(env.BROWSER)`. The Chromium archive (153 MB) downloaded fully both times it was tried, but extraction hung indefinitely at exactly the same point both times — 5 files, 17 MB in, immediately after `WidevineCdm/_platform_specific/linux_x64/libwidevinecdm.so` — with the process left sleeping (not crunching CPU, not disk-blocked; `df` showed 84 GB free) rather than erroring. The initial write-up of this entry guessed T-030's symlink-traversal advisory was the likely cause; checked directly afterwards (`zipinfo` on the still-cached archive, read-only — no write into that cache directory, since a `rm -rf` there was correctly denied mid-session as a protected path) and that guess was wrong: none of the archive's 144 entries are symlinks. The hang is real and reproducible at exactly the same point (`chrome-linux64/WidevineCdm/_platform_specific/linux_x64/libwidevinecdm.so`, a 17.6 MB executable — the fifth of 144 entries in the archive's own central-directory order, not alphabetical), but its cause was not root-caused further — that is out of Phase 0's scope, and this session's environment may not represent the owner's own machine or CI either way. Practically, the effect is the same as the "remote-only" branch of this check: nothing here proves a render works without either a working local extraction (not achieved) or a real Browser Rendering call, and the second option costs money (CLAUDE.md: ask before anything that costs money). **`core/pdf` is not silently deferred** — see O-014. All spike changes (the `wrangler.jsonc` binding, generated types, the throwaway test) were reverted; nothing from this check is committed.
- **T-059 `core/push` built to the scope agreed before writing code: subscription storage plus a single-delivery primitive, nothing that needs a caller which doesn't exist yet.** Built: `push_subscriptions` (`schema/core/`, D-003 minimal columns: `person_id` FK, `endpoint` unique, `p256dh`/`auth` — the Push API's own subscription keys, never generated here — `expiration_time`, `created_at`, migration 0005); `buildPushRequest()` (wraps the approved `@block65/webcrypto-web-push`'s `buildPushPayload`, confirmed against the installed package's compiled JS, not its docs, per T-023's precedent — VAPID keys and TTL are parameters, never read from `env`, T-019's pattern); `classifyPushResponseStatus()` (pure; `delivered`/`gone`/`retry`; `gone` = HTTP 404 or 410 specifically, per RFC 8030 §7.3 — anything else retries, since a wrongly-retried delivery only wastes a resend but a wrongly-`gone` subscription can never be recreated from the server side); `buildRemovePushSubscriptionStatement()` (`db.batch()`-composable, same shape as T-057's statement builders — brief section 9.5's "expired subscriptions are removed"). **`ttlSeconds` is a required parameter of `buildPushRequest()`, rejecting a non-positive value**, found in review: `buildPushPayload` itself defaults a missing *or falsy* TTL to 60 seconds (`message.options?.ttl || 60`), which would also silently swallow an explicit `ttl: 0` — inheriting that default would mean a dependency, not this portal, decides how long an undelivered phone alert survives (rules 2/5). The brief never states what that duration should be: see O-016. **Deliberately not built, all for the same reason — no caller exists yet (Phase 7 builds the Queue consumer and the browser-side subscribe flow), matching T-056's `fileRecord()` precedent:** the actual `fetch()` call to the push service; a function to store a newly-created subscription (the write side of a browser's `subscribe()` call — there is no route yet to receive one); the Queue consumer itself; VAPID secret names in `.dev.vars.example` (T-030's warning about `.dev.vars.example` applies here too — no reader, no entry); the retries Setting (brief section 9.5) and its interaction with Queues' own static `max_retries` (O-015). **Why `expiration_time` exists at all:** it mirrors the Push API's own `PushSubscription.expirationTime` (nullable — most browsers never set it, so pruning by this column alone would rarely remove anything real). It is *not* a claim about what "Push pruning" (brief section 11) actually sweeps on — that criterion is left to whoever builds that Phase 7 job; in practice the 404/410 path above is what actually removes a subscription today. Tests use a throwaway VAPID/ECDH keypair generated inside the test via `crypto.subtle`, proving real VAPID signing and RFC 8291 encryption end to end — never `.dev.vars`, never a real device.
- **T-061 `core/notifications` extended per D-031: `countUnreadNotificationsForPerson()` and `markAllNotificationsRead()`.** Both added to the existing `notifications-repo.ts` alongside `listNotificationsForPerson`/`markNotificationRead` rather than split into their own files — all four are plain CRUD-shaped queries against the one `notifications` table, the same grouping `settings-repo.ts`/`service-switches-repo.ts` already use for a module's own table (file stays at 71 lines, well inside the 250-line limit). `markAllNotificationsRead()` is one `UPDATE ... WHERE person_id = ? AND read_at IS NULL` statement, not a loop over individual rows. No new column or migration needed — both read `read_at`, which T-057 already built.
- **T-062 Unverified, flagged for checking before Phase 7 builds the push Queue consumer: does changing the "maximum attempts" Setting (D-032) require a redeploy, or can Cloudflare's Queues API update a consumer's `max_retries` without one?** D-032's first draft stated flatly that it needs a redeploy, matching D-001's cron-schedule precedent — that was this session's own inference, not something the owner said, and not checked against Cloudflare's current API before writing it. If a redeploy turns out to be required, the owner should be told plainly before Phase 7 ships it, since an administrator changing the Setting and seeing no effect until the next deploy would be a real surprise, not a minor implementation detail.
- **T-063 Cron and queue dispatchers built (brief section 11; T-016), empty registries, following the resume plan's own next step (dispatchers, then Clerk middleware).** Two independent registries, neither living under `core/` — the brief's own directory tree (line 163) puts `src/worker/cron/` and (implicitly, line 166's `core/push` aside) `src/worker/queues/` as top-level siblings of `core/`, for "one file per scheduled job"/consumer; nothing about the register-and-dispatch machinery a real job file will call is described there, so where it lives is this session's own internal-module-design call (D-012), placed directly in those two folders rather than nested under `core/`. `registerCronJob(name, handler)` allows exactly one handler per name (unlike `core/events-bus`'s multiple-handlers-per-event) — a scheduled job either runs or it doesn't, there's no "several reactions to one cron tick" case the brief describes. `dispatchScheduledJob(jobName, env)` runs the registered handler and **unconditionally** records the outcome to a new `job_runs` table (`id`-less, `job_name` itself as the primary key, upserted every run — brief section 11's "every job... records last-run time and outcome," current state only, not a history, same reasoning as `maintenance_mode`/`service_switches`) — the job file itself never has to remember to record its own result, and a failure is re-thrown after recording so Cloudflare's own Cron Triggers dashboard still sees it too. An **unregistered** job name throws immediately and records nothing — that's a deploy/wiring bug (the cron-expression-to-job-name map, `vars.CRON_JOBS`, and `triggers.crons` don't exist in `wrangler.jsonc` yet, T-010), not a job execution failure, so nothing meaningful could be recorded about it anyway. `registerQueueConsumer`/`dispatchQueueBatch` mirror this exactly for queues, minus the recording: the brief's "every job" line is specifically section 11's cron table; queue backlog and failures for the health screen (15 D1) read from Cloudflare's own Queue metrics, not a table this module writes. Neither dispatcher resolves a raw `ScheduledController.cron` string or a queue binding's name to the registry key — that mapping is `src/worker/index.ts`'s job once it exists (not built this session), so both dispatchers take the already-resolved name directly and are fully testable now via fixture handlers, the same way T-031's route sweep and T-055's events bus were proved before any real caller existed. `tests/cron/`, `tests/queues/` and their `tsconfig.worker.json`/`vitest.worker.config.ts` include entries are new (T-007's original test-project list predates these two source folders).
- **T-064 Clerk session middleware, the privacy-notice gate, `/api/me`, and the permission sweep's behavioural half — the first commit of two (brief sections 6.2/6.3/7.4, 13; T-020/D-024/D-027) — the webhook is the second, tracked separately.** Read in full before writing anything: brief sections 6.1–6.3, 7.4, 13, 15 C5/C6 — three things are stated there, not guessed: (1) "a signed-in user with no linked person holding a current term sees only the access not active page" (6.2) — already exactly what `loadRequestContext()` returns as `'not-active'`, built earlier; (2) the enforcement-in-three-layers cases (7.4); (3) the privacy notice's own shown-on-first-sign-in/footer/setup-checklist role (13, 15 C5/C6). What the webhook does with an email matching no `people` row is genuinely not stated anywhere and is deliberately left to T-065 (the webhook commit), not invented here.
  - **`core/errors` gains `UnauthorizedError` (401)** — "not signed in at all," distinct from `ForbiddenError`'s "signed in, but not this."
  - **Two new append-only tables** (migrations 0007/0008, triggers hand-written like 0001): `privacy_notice_versions` (`text_en`, nullable `text_ar` — D-022's fallback applies here too) and `privacy_notice_acknowledgements` (`person_id`, `notice_version_id`, `acknowledged_at`, unique per person+version — D-005's "who, when, which version"). The current version is simply the most recently inserted row — no `is_current` flag to go stale, matching T-020's original design note. New `core/privacy-notice` module (`getCurrentPrivacyNoticeVersion`, `hasAcknowledgedVersion`, `buildAcknowledgePrivacyNoticeStatement`) — not in brief section 3.1's or line 1032's core-module lists, same precedent as `core/maintenance-mode`/`core/security-headers` being added as needed (T-053/T-054). The acknowledge statement builder is built now despite having no route yet (no notice can be set before Phase 2's Administration panel) — deliberately following T-057's precedent (build the batch-composable statement even with no caller yet), not T-056's (defer everything) — because, unlike `fileRecord()`, it needs no infrastructure that isn't already available today.
  - **`verifyClerkSessionToken()` uses `verifyToken()` directly, not `@clerk/backend`'s own "recommended" `authenticateRequest()`.** That higher-level helper manages a cookie's handshake/refresh dance for browser navigation; brief section 6.3 is explicit that the session token travels in the `Authorization` header, never a cookie, so there is no cookie to refresh and no handshake state — confirmed by reading `authenticateRequest`'s purpose in the installed package, not assumed. Accepts either `secretKey` (production: Clerk's own `CLERK_SECRET_KEY`, already exists, network JWKS fetch, cached) or `jwtKey` (tests: a throwaway PEM public key, no network, no `.dev.vars`) — chosen by the caller, never a runtime/env check inside the function itself, so there is no test-bypass path in production code (advisor's explicit hard line). **A real, documented trap found and corrected before this was tested:** the installed package's compiled JS defines an *internal* `verifyToken` (in `tokens/verify.js`) that resolves a `{ data } | { errors }` result object and never throws — reading only that file (one level too deep) gives exactly the wrong answer. The *publicly exported* `verifyToken` (`@clerk/backend`'s root, both the `.js` and `.mjs` builds) wraps it with an internal `withLegacyReturn()` that throws `errors[0]` on failure and returns `data` directly on success — matching `index.d.ts`'s declared throwing signature after all. `authorizedParties` is derived from the request's own origin (`new URL(request.url).origin`, mirroring `requireSameOrigin`'s T-013 technique), never a hard-coded string or the Clerk publishable key.
  - **`resolveSessionState()` (`src/worker/middleware/`, not a core module — it composes two core modules for one request's sake, the same relationship a service would have to core) returns four states, not two:** `not-active` (from `loadRequestContext`), `notice-not-set` (no version has ever been entered — D-024's bootstrap case), `notice-not-acknowledged` (a real version exists, this person hasn't ticked it — carries the version id), `active` (the real `RequestContext`). D-027: no exemption anywhere for `isSystemAdmin` — the same rule `can()` already follows (T-042).
  - **Two middlewares, not one, matching the "the switch that gets you out can't sit behind the gate" shape `maintenanceModeGate`'s own off-route restriction already established:** `requireSignedIn` (D-004's `signed-in-only` — verifies the token, 401 if not, but never throws for `not-active`/notice states, just attaches whichever applies) and `requireActiveAccess` (every `capability`-classed route — verifies the token *and* requires fully `active`, throwing `ForbiddenError` with `access.not-active` / `privacy-notice.not-set` / `privacy-notice.not-acknowledged` otherwise). `/api/me` (`src/worker/api-me/`, `registerGetMeRoute`) uses only the first, so it can report whichever state applies instead of being blocked by the very state it exists to report.
  - **A genuine, not-yet-resolved bootstrapping gap, surfaced rather than invented an answer for:** D-024 says nobody (including administrators, D-027) gets past "access not active" until a notice exists, but doesn't say how the very first administrator reaches whatever screen sets that notice. `requireActiveAccess` applies the notice gate with no exemption for any capability, admin-panel included, since D-027's own words don't carve one out — if Phase 2's actual notice-setting screen needs a different answer, that's a question for whoever builds it, not resolved here since nothing in Phase 0 needs it resolved (no admin screens exist yet).
  - **The behavioural half of the permission sweep (`tests/permissions/route-sweep-behavioural.test.ts`) is real now** — three fixture-capability HTTP requests through the actual middleware chain, real signed tokens, real D1 grants: a Branch A officer reading Branch B's records, a branch officer attempting a national-unit action, and a system administrator (a `system_administrators` row, a current term, but no grant at all for the fixture capability) attempting to read content — all three fail 403/404, the last one directly proving P22 (`isSystemAdmin` grants nothing by itself). The pre-existing structural sweep (`route-sweep.test.ts`) already had `/api/me` and the webhook as fixture entries from an earlier session; its trailing comment claiming the behavioural half "needs building" was stale and is corrected to point here.
  - Production Clerk verification (a real Clerk-issued token, `secretKey`, an actual sign-in) is **not** exercised by any test — there's no frontend yet to produce one. Recorded as unverified until the frontend shell exists, not claimed as proven.
- **T-065 The Clerk webhook — the second commit of the pair T-064 started (brief section 6.2).** `verifyWebhook` (`@clerk/backend/webhooks`) does the same "sourcemap trap" homework as T-064 required for `verifyToken`: checked directly against the installed package's compiled `.mjs`, not assumed from its `.d.ts` — this one genuinely does throw (no `withLegacyReturn`-style wrapping), and it verifies via the `standardwebhooks` package's own `Webhook` class (`HMAC-SHA256(key, "id.timestamp.body")`, `svix-*` headers), confirming T-003's existing note that `svix` itself is never a dependency.
  - **Three `user.*` events handled, everything else ignored** (this portal doesn't use Clerk organizations, sessions webhooks, billing, etc. — brief section 6.1: Clerk only answers "who is this person?"): `user.created` and `user.updated` try every one of the Clerk user's email addresses (not only the primary — an officer may not have verified the invited address as primary the instant they accept) against `people`, case-insensitively (T-049), and link by setting `clerk_user_id`; `user.updated` additionally syncs the stored email for an already-linked person, and falls back to a fresh link attempt if not yet linked (webhook delivery order isn't guaranteed by Clerk); `user.deleted` clears `clerk_user_id` only — brief section 6.2's exact words, "a deleted Clerk user leaves the person record in place, unlinked" — the person row is never touched otherwise, and there is no delete path anywhere in this module.
  - **What happens when no address matches any `people` row at all is not stated anywhere in the brief — checked directly, not guessed.** A person row is only ever created by a register officer through the Committee register (not built yet), never by this webhook; the only non-destructive option is to do nothing (no error, no placeholder person created), so that's what's built. This is recorded as a technical call, not escalated as a question, because there was no second non-destructive option to choose between — inventing a placeholder-person-creation behaviour would be the actual guess.
  - The webhook route's own queries against `people` (`findPersonIdByEmail`, `findPersonIdByClerkUserId`, and the three statement builders, all in `src/worker/webhooks/link-or-sync-person-repo.ts`) are deliberately separate from `core/permissions`' own internal `findPersonByClerkUserId` (used by `loadRequestContext`, not exported) — same reasoning T-043 already gives for `core/permissions` querying `people`/`terms`/`roles` directly: each consumer queries the table itself until Phase 1's real Committee register service owns it; nothing here is a placeholder for that.
  - A verification failure (bad signature, wrong secret, missing headers) is caught and re-thrown as `UnauthorizedError('webhook.invalid-signature')` rather than left to fall through to a generic `server.error` 500 — a deliberate, specific code, chosen because "not accepted as authentic" fits 401 the same way a missing session token does, not because the brief names a status for it.
  - Tests sign real payloads with a throwaway HMAC secret via `crypto.subtle`, exercising the actual `standardwebhooks` verifier end to end (valid signature accepted and linked; wrong secret and no signature at all both rejected) — never `.dev.vars`, never a real Clerk secret.
  - **Two account actions this needs before it can run for real, batched for the owner, not done silently:** a new secret name (`CLERK_WEBHOOK_SIGNING_SECRET`, matching `@clerk/backend`'s own documented env var name) added to `.dev.vars.example` when `src/worker/index.ts` is assembled and actually reads it (not added yet — T-030's own rule: no reader, no entry); and a webhook endpoint configured in the Clerk dashboard pointed at a public URL, which needs the `preview` environment to exist (step 5) before it can be created.
- **T-066 Worker entry, full `wrangler.jsonc`, preview resources (step 5, 2026-09-24).** `src/worker/index.ts` builds the app once per isolate from `cloudflare:workers`' `env`; `src/worker/app/build-app.ts` assembles it: `handleAppError`, `securityHeaders` on `*`, `requireSameOrigin` and `maintenanceModeGate` on `/api/*` (so the privacy-notice acknowledgement is also refused while maintenance mode is on — "the whole portal read-only", brief section 12), the routes, a JSON 404 for any unclaimed `/api/*` path, then `ASSETS`. `buildApp(env, keys)` takes the Clerk verification keys as a parameter so tests can build the real app with a throwaway key; `index.ts`, the only production caller, always passes `CLERK_SECRET_KEY`. **Corrects T-010:** `assets.run_worker_first` is `true`, not just `/api/*` and the manifest — otherwise HTML and scripts would be served without the Worker ever running, and brief section 12 puts security headers on *every* response. The asset response is re-wrapped because a fetched response's headers are immutable. **Supersedes T-011's `.dev.vars.example`:** Wrangler's `secrets.required` lists the secret names in `wrangler.jsonc` itself (`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`); `wrangler types` generates them into `Env` with no values, so CI still needs no file, and local dev warns about a missing name — which is how the owner's `.dev.vars` was confirmed to use those exact names (only the webhook secret is missing, as expected) without opening it. Cron triggers follow D-001, mapped to job names by `vars.CRON_JOBS` per environment; `tests/structure/wrangler-config.test.ts` checks the map matches `triggers.crons` in every environment and that preview/production name only their own D-008 resources with R2 in the EU. **Until each job's phase registers its file, every trigger fires and throws "not registered"** (T-063's deliberate wiring-error behaviour) — visible in preview's Workers Logs, harmless, and not hidden. Queues are declared as **producers only**: a consumer's `max_retries` comes from an administrator Setting (D-032) that doesn't exist yet, so each consumer is declared by the phase that builds it (Phase 7 / `core/pdf`). Browser Rendering is bound in preview and production only (T-058: local extraction hangs). **Preview resources created 2026-09-24 (D-010):** `yafa-portal-preview-db` (`--jurisdiction eu`, confirmed `eu` in `wrangler d1 list`), `yafa-portal-preview-notifications`, `yafa-portal-preview-pdf-jobs`. **The two R2 buckets could not be created: R2 is not enabled on the account** (API error 10042) — an owner dashboard action. Vite: `CLOUDFLARE_ENV=preview vite build` selects the environment; `wrangler deploy --env` cannot retarget a Vite build.
- **T-067 What the frontend shell reads and writes (step 5).** `people.language` (migration 0009, nullable, `CHECK` in `('en','ar')`; the two languages live in `src/shared/core/languages.ts`, fixed by D-013, not configuration). `GET /api/me` now returns the officer's saved language once a person is linked and, when active, their own units (names only for units in `RequestContext.units`) with each unit's switched-on services (`listEnabledServices`, one query, same resolution as `isServiceEnabled`) and whether maintenance mode is on. `SessionState`'s two notice states now carry `personId`. New signed-in-only routes (D-004), each a sweep entry in `tests/permissions/app-route-sweep.test.ts`, which also checks that every `/api` route Hono serves is declared: `PUT /api/me/language` (own record only), `GET /api/privacy-notice` (404 for a not-active user, 404 `privacy-notice.not-set` when none exists), `POST /api/privacy-notice/acknowledgements` (only in `notice-not-acknowledged`, only for the version still current — a notice changed mid-read is refused with 409 `privacy-notice.version-changed`).
- **T-068 Frontend shell (brief section 26, Phase 0), 2026-09-24.** `index.html` at the repository root (Vite's convention) with an empty `<title>`: the organisation's name comes from branding (15 C3, Phase 2), never code (D-006). `src/web/main.tsx` → `AppRoot` (language provider → Clerk provider with `enGB`/`arSA` for the current language → TanStack Query → React Router). Signed out: Clerk's `<SignIn routing="hash">`. Signed in, by `/api/me` status: "access not active" for `not-active` and `notice-not-set` (D-024), the privacy-notice screen for `notice-not-acknowledged` (tick box, then Continue — disabled while the notice has no text in the current language), otherwise the portal. The "access not active" message is an administrator text (15 C5, Phase 2), so until that exists the page shows the brief's own "This has not been set up yet" message (rule 5). Portal layout: header (unit switcher only for people in more than one unit, language switcher, sign out), service navigation (only services switched on for the selected unit, brief section 8.4; the Administration panel link only for someone holding an `administration-panel.*` capability — a UI hint, T-042), page, footer link to the privacy notice (brief section 13), maintenance banner while maintenance mode is on. Every service page is empty (a heading only) and is "not found" when the service is off for the selected unit. Admin layout at `/admin` with the four stages from brief section 25 as empty pages, and "not found" without an administration capability. The selected unit is remembered in `localStorage` on this device only; the server still checks every request. Texts: `src/web/text/en|ar/`, one file per service plus `portal-shell.ts`, with `TextShape<>` enforcing the Arabic bundle's keys at compile time and `tests/structure/text-key-parity.test.ts` at test time. Language names always appear in their own script. Service worker (`public/service-worker.js`): claims clients, caches nothing; Phase 7 adds push. **Not built: the `/manifest.webmanifest` route** — D-006/D-025 serve it from branding, which doesn't exist until Phase 2, so there is nothing yet to serve (O-020). **New dev dependencies:** `@types/react` and `@types/react-dom` ^19.3.0 — type definitions only, never bundled, needed for strict TypeScript to check the already-approved React (D-012 build tooling, T-053's precedent). Playwright's Chromium was downloaded locally (not a package) to check the running app. **Checked in a real browser (headless Chromium, `npm run dev`):** English renders left-to-right and Arabic right-to-left with Clerk's Arabic sign-in screens. Signed-in screens are covered by jsdom tests only: no real Clerk user exists yet to sign in with.
- **T-069 The Content Security Policy allows inline scripts under the Vite dev server only.** Found by loading the app, not assumed: Vite's dev server injects an inline React-refresh preamble, the strict `script-src` blocked it, and `npm run dev` rendered a blank page. `buildContentSecurityPolicy`/`securityHeaders` now take `{ viteDevServer }`; `build-app.ts` passes `import.meta.env.DEV`, which the production build replaces with the literal `false` (confirmed in `dist/yafa_portal/index.js`). A test proves the production policy has no `'unsafe-inline'` in `script-src` and that the dev policy differs by exactly that. Separately noted, not changed: Clerk's development-mode badge loads a `data:` image that `img-src` blocks (cosmetic, console only).
- **T-070 Deploy scripts, CI deploy-preview job, Playwright (step 5).** `deploy:preview` is `CLOUDFLARE_ENV=preview vite build && wrangler deploy` (Wrangler then follows the build's redirect file to the flattened preview config; `wrangler deploy --dry-run` confirmed every preview binding). New `db:migrate:preview` applies migrations to `yafa-portal-preview-db --remote`. Because Wrangler follows that redirect file after any build, `types` and `db:migrate:local` now pass `--config wrangler.jsonc` explicitly, so a local command never picks up the preview config by accident. `.github/workflows/ci.yml` gains `deploy-preview` (D-007): on `main`, after `verify`, it applies migrations and then deploys, using three GitHub secrets the owner sets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_CLERK_PUBLISHABLE_KEY`). **Corrects T-032's wait:** every code-side prerequisite now exists. The job will fail until the owner enables R2 (so the buckets can be created) and sets those secrets. That is intentional: a red job is the visible signal. `playwright.config.ts` runs `tests/e2e/**/*.test.ts` (brief section 5.1 naming) against the local dev server in two projects, `english` (`en-GB`) and `arabic` (`ar`), per brief section 28. It is not in CI, because it needs the Clerk development keys. First journey: the signed-out sign-in screen in each language (both pass). Journeys past sign-in need a Clerk test user, which Phase 1 provides.
- **T-071 CI was failing in the tests, not the deploy: worker tests now get fictional Clerk values (2026-09-24).** The owner's diagnosis, confirmed by reproducing CI in a clean clone with no `.dev.vars`/`.env.local`. Every worker test file failed to load, because the Workers test runner loads `src/worker/index.ts` (the `main` in `wrangler.jsonc`, since T-066), which builds the app, and `securityHeaders` parses `CLERK_PUBLISHABLE_KEY` at startup (`parsePublishableKey`, "Publishable key is missing"). Claude Code's first explanation (missing Worker secrets at deploy) was wrong about CI: the deploy step was never reached. It is still true of the first manual deploy, which needs the secrets supplied with it. **Fix, in the test setup only:** `vitest.worker.config.ts` supplies clearly fictional values for all three `secrets.required` names through `miniflare.bindings`: a development-format `pk_test_` key for the non-existent `fictional-test-instance.clerk.accounts.dev`, `sk_test_fictional_not_a_real_key`, and `whsec_fictional_not_a_real_secret`. Miniflare's merge gives these precedence over `.dev.vars`, so local runs use them too, match CI, and no test ever sees a real key. `tests/app/fictional-test-secrets.test.ts` proves this; it compares values as booleans, so a failure can never print a real secret. The security headers are unchanged, and no real key goes into GitHub. **Checked the rest of startup:** `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET` are only passed along at startup and used per request, and the web app's `VITE_CLERK_PUBLISHABLE_KEY` is read only in the browser (no web test imports `main.tsx`, and CI's verify job does not build). The publishable key was the only startup reader. Verified in the clean clone: `wrangler types`, type check, lint, format, 57 files / 240 tests, and the permission sweep all pass.
- **T-072 `core/pdf` built, and checked for real through Browser Rendering (brief section 9.4, D-030), 2026-09-24.** `renderPdf(browserBinding, input, page)` takes the rendered template body, the combined stylesheet, the language and the fonts, plus page size and margins from the caller (the letterhead layout is a branding setting, 15 C3). Nothing about fonts, page size or text is coded. `buildPdfDocument` sets `lang`/`dir` on `<html>` from the language (brief section 9.4: "the correct direction and fonts"). `buildFontFaceCss` embeds every font as a `data:` URL. `renderPdf` refuses every request the page makes except `data:` resources, so a render never reaches an outside service (brief section 8.5), and it waits for `document.fonts.ready` before printing. The five templates and the shared stylesheet in `src/pdf-templates/` arrive with the phases that own them; the Queue path for slow reports arrives in Phase 8/11. **Normal tests** (`tests/core/pdf/`, in CI) cover document assembly and font embedding. **The real check is opt-in:** `npm run test:pdf-remote` (`vitest.pdf-remote.config.ts`, not a project in `vitest.config.ts`, so `npm test` and CI never call the paid service). It starts a test-only Worker (`tests/pdf-remote/`, remote `BROWSER` binding, never deployed) with Wrangler's `unstable_startWorker`, renders one English and one Arabic sample through the real `renderPdf`, saves them to `docs/pdf-samples/`, and asserts with `pdffonts` that the PDFs embed only the fixture fonts, with no fallback font. The route was chosen because `@cloudflare/puppeteer` needs Workers-only WebSocket APIs (so it cannot run in Node), and a test inside workerd cannot write the samples to disk. **Result, 2026-09-24:** both pass. The English sample embeds only `NotoSans`; the Arabic sample embeds only `NotoNaskhArabic`, whose own Latin glyphs covered the Latin words, so the Noto Sans fallback was never needed. Checked by eye (pages rendered to images with `pdftoppm`): Arabic runs right to left, letters join correctly, the lam-alef ligature is right, a Latin phrase sits correctly inside a right-to-left line, and Arabic-Indic digits render. **Owner's visual review is still wanted** (`docs/pdf-samples/`). **Fixture fonts:** Noto Sans and Noto Naskh Arabic from `google/fonts` (SIL OFL, licences beside them in `tests/fixtures/fonts/`). They are test fixtures only; the portal's fonts come from branding. **One observation for Phase 2:** these are variable fonts, and Chrome embedded them as Type 3 fonts. The text is still extractable (ToUnicode present), but static (non-variable) font files usually embed as ordinary TrueType, which some PDF viewers display more crisply. Worth preferring static files when the branding fonts are chosen. **Browser Rendering usage: 2 calls** (one run, one call per language). T-030's `extract-zip` advisory re-checked: `renderPdf` uses only the binding and never the local-Chromium download path it affects, so nothing changes.
- **T-073 CI lint failure, 2026-09-24: my gate check was wrong, and three commits went out failing lint.** From the progress-page redesign (D-045) onwards, I read lint's result with `npm run lint | tail -1`. When ESLint reports errors its last output line is blank, which looked exactly like a clean run. So the D-045, D-046 and D-047 commits were pushed with 10 lint errors (reported by the owner from GitHub Actions). CI's `verify` job failed on each, so `deploy-preview` never ran and none of the three reached the preview. **Fixes:** `read-progress-summary.ts` narrows its field lookup through `Object.entries` instead of an `as` assertion; `tsconfig.node.json` includes the `DOM` library, since the Playwright tests run code inside the page (`checkVisibility`, `classList`). **Process fix:** the gate is now judged by each command's exit code (`if npm run lint …; then PASS`), never by reading the tail of its output.
- **T-074 Role designations and fixed grants (Phase 1, step 1a).**
  - **Migration `0010_roles_names_and_designation`:** renames `roles.name` to `name_en` and adds `name_ar` (D-052), plus `designation`. The `CHECK` allows only the brief's two labels, "Branch register officer" and "National register officer" (brief 5.1: enum values are the brief's exact labels), and a partial unique index allows one role per designation.
    - `drizzle-kit`'s generated SQL was hand-edited before it was applied anywhere. SQLite can't add a `NOT NULL` column without a default, so `name_ar` defaults to `''`, and a `CHECK (name_ar <> '')` means no row can ever hold that value. No role rows existed anywhere.
    - The generator needed a pseudo-terminal (`script`) to answer its "renamed or new column?" question with "renamed".
  - **Fixed grants:** a catalogue entry can declare `fixedGrants` (designation plus scope). For such a capability, `can()` (via `grantsForDefinition`) takes grants only from the person's current terms in designated roles, each at that term's unit, and ignores any matrix grant (brief 7.3: "never editable"). Registering a fixed grant at a scope the capability doesn't allow throws.
  - **Tests:**
    - a branch register officer holds their own branch only;
    - the national register officer holds every branch;
    - a matrix grant for a fixed capability gives nothing;
    - the roles table refuses a second holder of a designation, an unknown designation, and an empty Arabic name.
- **T-075 The Phase 1 capability catalogue, and `docs/permissions.md` generated from it (step 1b).**
  - **Where it lives:** the definitions are plain data in `src/shared/<service>/capabilities.ts` (brief 5.3: shared schemas, one file per service), because the Phase 1 matrix editor must show the same list, fixed entries locked. The types moved to `src/shared/core/capability-definition.ts`. Each service's `index.ts` registers its list, and `buildApp` registers every list once (`src/worker/app/register-capabilities.ts`), so registration also validates every name and fixed scope.
  - **Committee register:** fixed by designation wherever brief 7.3 and section 14's "Who does what" decide it:
    - branches and standard roles: the national register officer alone, all units;
    - branch extra roles, officers and terms (with invitations and past officers), elections and handovers: the branch register officer for their own unit, the national register officer for all units.
  - **Committee register, through the matrix:** confirming elections (brief 14 build notes: "set in the permissions matrix"), and reading the register with contact details (brief 13).
  - **Administration panel:** A1 system administrators, A2 officer accounts, A3 permissions matrix, A4 access check, B2 role designations, B3 lists, C6 set-up checklist. All portal-wide, held by system administrators (D-046), grantable to others through the matrix. Units and standard roles in the panel use the Committee register's fixed capabilities (brief 25 rules).
  - **On-screen wording:** `label`/`description` are documentation. The matrix editor's own wording will come from `src/web/text/`.
  - **The doc:** `docs/permissions.md` is rendered by `scripts/permissions-doc/`. `tests/structure/permissions-doc.test.ts` checks that names are unique, well formed and filed under their own service, that fixed scopes are allowed, and that the doc is up to date. `npm run permissions-doc` rewrites it.
- **T-076 System administrators: appoint, list, remove (brief 25 A1, P21), step 2a.**
  - **Feature:** `src/worker/services/administration-panel/system-administrators/` (routes, service, repo, schema). Routes: `GET`/`POST /api/administration-panel/system-administrators` and `DELETE …/:personId`, each declaring `administration-panel.system-administrators.manage` and carrying `requireActiveAccess`. The service checks `can(…, { portalWide: true })`.
  - **`can()` portal-wide form:** `can()` gains `{ portalWide: true }` for actions on no one unit (the Administration panel). Only an `all units` grant covers it, besides D-046. This replaces passing an arbitrary unit id.
  - **Appointing:** needs a current term in a General Council unit. Brief 25 A1 reads "Appoint and remove system administrators (General Council unit)", and D-027 already requires administrators to hold a term. Appointing someone twice is refused (409).
  - **Removing:** refused with `system-administrators.minimum-two` (409) while two or fewer remain (P21). Migration `0011_system_administrators_minimum_two` adds a `BEFORE DELETE` trigger that refuses the same delete at the database, whatever path it comes by.
  - **Audit:** every change is written in one batch with its audit entry (`system-administrator.appointed` / `.removed`).
  - **Sweep:** the three routes are added to `app-route-sweep`. The route test is the behavioural check: a branch officer without the capability gets 403 on all three.
  - **Not yet:**
    - the screen (it waits for people records to carry names, in the people step);
    - "multi-factor required" (step 2b).
- **T-077 System administrators must use a second factor (brief 6.3 "System administrators always must"; 25 A1 "multi-factor required"), step 2b.**
  - **Reading it:** `verifyClerkSessionToken` now returns `{ clerkUserId, secondFactorVerified }`, read from Clerk's session-token `fva` claim ([first factor age, second factor age] in minutes; -1 means never). Clerk documents that claim as experimental, so anything missing or malformed counts as not verified: the check fails closed. It is unverified against a real Clerk-issued token until the first real sign-in.
  - **The gate:** `resolveSessionState` returns a new `second-factor-required` state for a system administrator whose session had no second factor, checked before the privacy notice. It is read literally: an administrator can't use the portal at all until they have one, not merely their admin powers withheld. `requireActiveAccess` refuses it with `session.second-factor-required`, and so do both privacy-notice routes (the type checker found the acknowledgement route would otherwise have accepted it). The language switch still works.
  - **The screen:** `SecondFactorRequiredPage` shows the explanation with Clerk's own `UserProfile` panel to set up two-step verification, then a sign-out button.
  - **Tests:**
    - `fva` is read as verified, never verified, and absent;
    - an administrator without a second factor gets the new state, and with one moves on to the notice;
    - the system-administrator routes refuse a session without a second factor.
  - **Deferred:** the per-role multi-factor setting (brief 14 settings: "roles requiring multi-factor authentication") comes with the settings step.
  - **Review file:** `docs/arabic-texts-review.md` is now generated (`npm run arabic-texts-review`) and kept in step by `tests/structure/arabic-texts-review.test.ts`.
- **T-078 The permissions matrix API: versioned, restorable, fixed rules locked (brief 25 A3), step 3a.**
  - **Live grants:** `permission_grants` stays the live matrix `can()` reads. A cell (role × capability) holds a set of scopes, for example own unit plus national content, and an edit sets the cell's whole set.
  - **Versions:** migration `0012` adds `permission_matrix_versions` (number, change as JSON, who, when) and `permission_matrix_version_grants` (a full snapshot per version). Migration `0013` makes both append-only by trigger and refuses any version number that isn't the next in sequence.
  - **Conflicts:** every change, or restore, is one batch: the new version, the grant writes, the snapshot and an audit entry. The version row goes first, so a change built on a stale version is refused by the database as a whole batch (rule 6: logic that depends on current data lives in SQL), mapped to 409 `permissions-matrix.changed`. The service also checks `expectedVersion` first, for a clear answer in the common case.
  - **Validation:** fixed capabilities are refused (`permissions-matrix.fixed-rule`, brief 7.3, "shown locked"); so is a scope the catalogue doesn't allow. An unchanged cell makes no new version. Restoring version N writes version N+1 with N's grants, keeping only grants the catalogue still knows, never fixed ones.
  - **Routes** (all declaring `administration-panel.permissions-matrix.manage`, each with a sweep entry): `GET /api/administration-panel/permissions-matrix`, `PUT …/cells`, `GET …/versions`, `POST …/versions/:number/restore`. The view type is shared in `src/shared/administration-panel/permissions-matrix.ts` for the screen.
  - **Tests:**
    - the empty matrix at version 0, with fixed rules marked;
    - setting a cell makes a version with its snapshot and audit entry;
    - a stale edit, a fixed rule and an unallowed scope are refused;
    - restore works as a new version;
    - 403 on all four routes for an officer without the capability;
    - direct `DELETE`/`UPDATE` of versions, and an out-of-sequence number, are refused by the database;
    - a racing batch is refused in SQL with none of it written.
- **T-079 The permissions matrix screen (brief 25 A3), step 3b.**
  - **Route:** `/admin/access-and-permissions/permissions-matrix`. The "Access and permissions" stage page now lists its built screens from `src/web/app/admin/admin-screens.ts`, each shown only to someone holding that screen's capability (a UI hint; the server decides).
  - **Layout:** capabilities grouped by service in brief 3.1's order, each a collapsible card.
    - **A fixed rule** shows "Fixed rule" and who holds it: designation plus scope, locked, with nothing to tick.
    - **Any other capability** lists every role (a branch's own extra role marked as one), with one tick box per scope the catalogue allows.
    - **A tick** saves that cell at once against the version it was made on. If someone else changed the matrix first, a notice says so and the latest version loads.
    - **History** lists every version newest first, with date and time (London time, Western digits per D-048), who made it and what changed, and a restore button on every version but the current one.
  - **Wording:** everything on screen comes from `src/web/text/`: capability names per service (`capabilities`), scope and designation labels, and the screen's texts, all in English and Arabic. `fillText` fills `{placeholders}`.
  - **Tests:**
    - `tests/structure/capability-texts.test.ts`: every catalogued capability is named in both languages, and nothing extra;
    - the text-key parity test now walks key paths as lists, since capability names contain dots and joined paths broke its lookup;
    - jsdom tests: the fixed and editable cards, the new scope set a tick produces, Arabic names, and history order and restore.
  - **Not yet checked in a real browser:** that needs a signed-in administrator, which first exists once the seed files are loaded.
- **T-080 Register core, step 4a: the schema for units and people.**
  - **Migration `0014`:** renames `units.name` to `name_en`; adds `name_ar` (D-054), `area` (branches; empty for the General Council), `status` (`active`/`inactive`, brief 14 A1, P4), and people's `name` and `phone` (D-053).
  - **Hand-edited as in 0010:** each new `NOT NULL` column takes a placeholder default only because SQLite requires one, and a `CHECK` forbids that value. No unit or person rows existed anywhere.
  - **Knock-on changes:** `/api/me`, the unit switcher and the home page show a unit's name in the officer's language. Raw-SQL test inserts supply fictional values, and a new integrity test proves the checks.
  - **Deferred from brief 25 B1:** the letterhead address and calendar colour are used in Phases 10 and 6, and whether the address is in one language or two isn't stated, so they're added once that is asked and answered.
- **T-081 Branches (brief 14 A1, 25 B1), step 4b.**
  - **Routes:** `src/worker/services/committee-register/branches/`: `GET`/`POST /api/committee-register/branches` and `PATCH …/:unitId`, each declaring and checking the fixed `committee-register.branches.manage` (the national register officer alone, brief 7.3).
  - **The list:** the General Council first, then branches by English name.
  - **Adding:** adds a branch with code, English and Arabic names, area and status. The code is letters, digits and hyphens, as the seed spec says, and a code already in use is refused (409 `branches.code-taken`).
  - **Changing:** any of those fields. A branch may be made inactive (P4); the General Council may not, and takes no area.
  - **Audit:** each change is one batch with its audit entry, recording before and after.
  - **Tests:** covered in `tests/api/committee-register/branches/`, including 403 for a branch register officer and for a system administrator (P22). Sweep entries added.
- **T-082 Roles (brief 14 B2, 25 B2), step 4c.**
  - **Standard roles:** `GET`/`POST /api/committee-register/roles` and `PATCH …/:roleId`, the national register officer alone (fixed).
  - **A branch's own roles:** `GET`/`POST /api/committee-register/branches/:unitId/roles` and `PATCH …/:roleId`, for the branch register officer for their own branch and the national register officer for all (fixed).
  - **Names:** unique in both languages among the roles a unit can use: standard roles among themselves, and a branch role against the standard ones and its own branch's (brief 14 B2, "the same role means the same thing in every branch").
  - **The setting:** registers `committee-register.branches_may_add_roles` (brief 25 B2: whether branches may add extra roles). It's a yes/no value, portal-wide, not required, with no default.
    - Unset: adding a branch role is refused with 503 `setting.not-configured`, so the action waits (rule 5).
    - Set to no: refused with `roles.branch-roles-not-allowed`.
  - **Inactive branches:** they take no new or renamed roles (P4, `requireActiveBranch`).
  - **Audit:** every change is audited.
  - **Registration:** settings are now registered at app build next to the capabilities, and the file is renamed `register-catalogues.ts` to match its job.
  - **Not built:** deleting roles, since the brief doesn't mention it.
- **T-083 Role designations (brief 7.2, 25 B2), step 4d.**
  - **Routes:** `GET`/`PUT /api/administration-panel/role-designations`, declaring and checking `administration-panel.role-designations.manage` (system administrators, D-046; others through the matrix).
  - **Where the writes live:** the `roles` table belongs to the Committee register, so the designation writes live there (`roles/role-designations.repo.ts`), and the Administration panel reaches them only through the Committee register's `index.ts` (brief 5.3).
  - **Rules:**
    - Only a standard role can be designated.
    - A role holds at most one designation.
    - Moving a designation clears the previous holder in the same batch, backed by 0010's unique index.
    - `null` clears it.
    - Every change is audited with before and after.
  - **Proven by test:** designating a role gives its holders the fixed register powers at once. An officer holding the newly designated role goes from 403 to 200 on the branches list.
- **T-084 The Administration panel's two settings (planned in T-019) are registered.** Step 4e (adding officers) is the first to need them. `administration-panel.new_officer_language` is required and has no default: adding a new person waits until it is set. `administration-panel.arabic_digits` (`western` or `arabic-indic`) is not required: unset means Western digits (D-048). `core/permissions` now exports `termIsCurrent(today)`, the same rule `currentTermCondition` uses (D-019, D-029), so the register's queries share it rather than restating it.
- **T-085 Officers, people and terms of office (brief 14 A2, B1, B3, C3; P5), step 4e.**
  - **Routes:** `GET /api/committee-register/units/:unitId/officers` (terms not yet ended, including any starting later) and `…/past-officers` (terms ended, newest first) declare `committee-register.register.read`. The service lets in either a reader through the matrix or whoever manages that register. `POST …/officers`, `PATCH /api/committee-register/people/:personId` and `PATCH /api/committee-register/terms/:termId` declare `committee-register.officers.manage` (fixed: branch register officer for their own branch, national register officer for all).
  - **Adding an officer:** name, email (stored lowercase, to match the webhook's case-insensitive linking), phone, role and start date.
    - A known email adds a term to that same person (P5); the same role held twice in one unit is refused.
    - The role must be one the unit can use.
    - A new person starts in `administration-panel.new_officer_language`, and until that's set, adding a new person waits (503, rule 5).
    - The unit must be the General Council or an active branch (P4, `requireWritableUnit`).
  - **Editing a person:** name and phone only, by whoever manages any unit the person has held a term in. The email changes only through Clerk's sync (brief 6.2).
  - **Ending a term:** sets its end date, only while it hasn't ended. The end must come after the start. An ended term is history: nothing changes or deletes it, and there is no delete route for people or terms (tested).
  - **Audit:** every change is audited.
  - **Fixture correction:** one standard role is now shared per designation, the way the portal works. The database's one-role-per-designation index caught the old version.
  - **Next:** Clerk invitations (brief 6.2) come as their own step.
- **T-086 Invitations and officer account states (brief 6.2, 25 A2; D-061), step 4f.**
  - **The Clerk adapter:** `src/worker/clerk/` holds a `ClerkAccounts` interface (`invite`) and `createClerkAccounts(secretKey)`, which uses `@clerk/backend`'s `invitations.createInvitation({ notify: true, ignoreExisting: true })`. `buildApp` takes it as a parameter: `index.ts` passes the real one, and tests pass `fakeClerk()`, so tests never reach Clerk or send real email.
  - **Adding an officer:** sends their invitation after the D1 batch, unless they're already linked or already have a sent invitation (so a second term doesn't re-invite). Clerk and D1 can't commit together, so a failed send is recorded as `failed`, never rolled back, and can be resent.
  - **The record:** migration 0015 adds `invitations` (`sent`/`failed`, Clerk's invitation id, who, when), which migration 0016 makes append-only by trigger, plus `people.clerk_unlinked_at` and `people.account_locked_at`. The webhook sets `clerk_unlinked_at` on `user.deleted` and clears it on relinking.
  - **Account states**, worked out in SQL with the brief's exact labels:
    - **Locked:** the portal locked the account (4g).
    - **Active:** a Clerk account is linked.
    - **Not linked:** the account was linked, then Clerk deleted it.
    - **Invited:** an invitation was sent.
    - **Not invited:** none of the above.
  - **Routes:** `GET /api/administration-panel/officer-accounts` and `POST …/:personId/invitation` (resend, refused for Active or Locked), both `administration-panel.officer-accounts.manage`. The query lives in the Committee register and is reached through its `index.ts`.
  - **No personal data in logs:** a failed send logs only "invitation failed".
  - **Next, 4g:** locking and unlocking, signing out of all sessions, removing push devices, and the "lock when the last term ends" setting.
- **T-087 Account actions and the automatic lock (brief 25 A2, 6.2, 14 settings), step 4g.**
  - **Routes:** `POST /api/administration-panel/officer-accounts/:personId/lock`, `/unlock`, `/sign-out` and `/remove-push-devices`, all `administration-panel.officer-accounts.manage`.
  - **The adapter:** `ClerkAccounts` gains `lock`/`unlock` (Clerk's `lockUser`/`unlockUser`) and `signOutEverywhere` (lists the account's active sessions and revokes each).
  - **Order:** Clerk acts first, and only then does the portal record it, with an audit entry. If Clerk fails, the answer is 503 `clerk.unavailable` and nothing is recorded (tested).
  - **The portal enforces locks too:** a locked person (`account_locked_at`) resolves to `not-active` in `loadRequestContext`, so the lock takes effect on their next request whatever Clerk does with sessions already issued.
  - **Removing push devices** deletes the person's `push_subscriptions` rows. These are device registrations, not records.
  - **The setting:** `committee-register.lock_account_when_last_term_ends` (yes/no, not required).
    - When ending a term, if the end date has been reached, the person has no other current term, the setting is yes, and the account is linked and unlocked, the account locks. `PATCH …/terms/:termId` now answers `{ accountLocked }`.
    - Unset means no automatic lock (rule 5: the lock is the action that waits).
    - A term ended with a future date is not locked on that date: that needs a scheduled job, and D-001 lists none (O-025).
  - **Not built here:** revoking a calendar feed token (25 A2), since feed tokens are built in Phase 6.
- **T-088 Lists and the fixed archive categories (brief 8.2, 13 A3, 25 B3).**
  - **Lists:** migration 0017 adds `list_items`: the list must be one of the brief's five (event types, meeting types, achievement categories, equipment conditions, handover checklist items), and each item has an English and an Arabic name. The bilingual names follow D-052/D-054 by analogy and are flagged for the owner.
  - **Archive categories:** migration 0018 creates the six fixed categories (Events, Meetings, Finance, Annual reports, Governance, General), with Arabic names drafted by Claude Code and awaiting review. Triggers refuse any insert, update or delete.
  - **Routes:** `GET /api/administration-panel/lists` (all items, plus the categories read-only), `POST …/:list/items` and `PATCH …/:list/items/:itemId`, all `administration-panel.lists.manage`.
  - **Rules:** names are unique within a list in both languages; every change is audited.
  - **Not built, pending the owner:** removing an item (O-026) and ordering items (O-027).
- **T-089 Handovers (brief 14 C2, D-067).**
  - **Tables:** migration 0019 adds `handovers` (unit, role, outgoing and incoming person, who can never be the same, each side's confirmation time) and `handover_items` (names copied, so renaming the list never rewrites a handover; ticked time and who).
  - **Triggers** (migration 0020): a handover is never deleted; its unit, role and officers never change; a confirmation is never undone; a completed handover is locked; and its items can't be added, changed or removed once either side has confirmed.
  - **Setting up:** register officers only (fixed `handovers.manage`). Both officers must have held a term in the unit, and the role must be one the unit can use. The checklist starts from the "handover checklist items" list, read through the Administration panel's `index.ts`.
  - **Changing items:** register officers add and remove items until confirmation starts.
  - **Ticking:** register officers, or the two named officers if the matrix lets them take part, tick and untick items until confirmation starts.
  - **Confirming:** only the officer named on each side, once each, recording who and when.
  - **New capability:** `committee-register.handovers.confirm` ("take part in a handover"), granted through the matrix. Brief 7.4 requires every route to declare a capability, and confirming belongs to named people rather than a role; the service additionally requires being the named officer. Flagged to the owner.
  - **Tests:** covered in `tests/api/committee-register/handovers/`, across the whole lifecycle. The database lock is tested directly.
- **T-090 The access check (brief 25 A4).**
  - **`describeAccess`** (`core/permissions`) works out every capability a person holds today, with its scope, the unit of the term it comes through, and its source: matrix, fixed rule, or system administrator. It is built on the same functions `can()` uses (`grantsForDefinition`, the D-046 rule), so the two can't disagree.
  - **Routes:** `GET /api/administration-panel/access-check/people` (names, to choose from) and `…/people/:personId` (their current terms, unit and role, plus the grants), both `administration-panel.access-check.read`. Permissions only: no contact details, no records, and nothing acts as the person.
  - **Tested against `can()` itself:** for a branch register officer, every catalogued capability is listed if and only if `can()` allows it for their unit.
- **T-091 The set-up checklist (brief 25 C6).**
  - **Route:** `GET /api/administration-panel/setup-checklist` (`administration-panel.setup-checklist.read`).
  - **What it lists:**
    - the privacy notice first, while none is set (D-024: "required before anything else");
    - each register officer designation not yet given to a standard role (7.2);
    - each required setting not configured (8.1), grouped by service.
  - **Not yet:**
    - **Lists:** they join once a service declares the lists it needs; none does yet.
    - **Per-unit items:** they come with the first unit-level requirement.
    - **The switch rule:** "A service cannot be switched on for a unit until its checklist is complete" is enforced by the Phase 2 service-switch screen (25 C2), which reads this checklist.
- **T-092 Elections (brief 14 C1; P3; D-055, D-066, D-068).**
  - **Tables:** migration 0021 adds `elections` (Draft/Confirmed, date, optional `corrects_election_id`, start date and who confirmed), `election_positions` (a role, and at least one seat) and `election_candidates` (unique per position; votes, never negative; elected).
  - **Triggers** (migration 0022): elections are never deleted, and a Confirmed election, its positions and its candidates can never be changed.
  - **Recording:** the register officers (fixed `elections.manage`) record a Draft with positions (roles the unit uses) and candidates. A candidate is an existing person, or a new one (P3): a person record with no term and no invitation, created in the new-officer language (waits if unset). Removing a position or candidate is possible only while it's a Draft. Results are a vote count and "elected" for every candidate.
  - **Confirming** (matrix `elections.confirm`) requires a Draft, a start date on or after the election date, results for every candidate, and exactly as many elected as seats in each position. Then, in one batch:
    - the election becomes Confirmed with its start date S;
    - the running terms of each position's role in the unit end on S (D-068);
    - each elected candidate gets a term from S;
    - an audit entry is written.

    The lock trigger makes a second confirmation fail as a whole batch.
  - **After confirming:** elected people without an account are invited (P3). If S has arrived, outgoing people left with no term are locked, subject to the setting.
  - **Corrections:** a new election whose `corrects_election_id` is a Confirmed election of the same unit (D-066).
  - **Routes:** covered in `tests/api/committee-register/elections/`, with sweep entries. There is no delete route for an election.
- **T-093 The system administrators screen (brief 25 A1).**
  - **Screen:** `/admin/access-and-permissions/system-administrators`, listed on the stage page for holders of `administration-panel.system-administrators.manage`. It shows each administrator's name, email and appointment date, and an appoint form.
  - **Candidates:** a new route, `GET /api/administration-panel/system-administrators/candidates` (same capability, sweep entry added), lists the people who may be appointed: a current General Council term (the same currency rule as `can()`, D-029), not already an administrator. The list now carries names too.
  - **P21 on screen:** the remove buttons are hidden while only two remain, with a note saying why. The server and the trigger still decide; a refusal is shown by its code's text.
  - **Removal has no confirmation step:** it can be undone by appointing again, and it is audited.
  - **Texts:** in `src/web/text/<language>/system-administrators.ts`; the Arabic is a draft for the owner's review (D-013).
- **T-094 The officer accounts screen (brief 25 A2).**
  - **Screen:** `/admin/access-and-permissions/officer-accounts`. It shows every person with name, email, access state (the brief's five labels) and the date they were last invited.
  - **Actions by state,** the same rules the server applies:

    | State | Actions |
    |---|---|
    | Not invited, Invited, Not linked | resend invitation |
    | Active | lock, sign out of all sessions, remove push devices |
    | Locked | unlock, sign out of all sessions, remove push devices |

    Each action reports its outcome, a failed invitation send, or the refusal's text.
  - **No confirmation step:** every action can be undone or repeated, and each is audited.
  - **`ACCOUNT_ACTIONS`** moved to `src/shared/administration-panel/account-state.ts`, so the routes and the screen share one list.
  - **Not yet:**
    - **Revoke calendar feed token:** waits for the calendar feed (Phase 6), which issues the tokens.
    - ~~**The link to register details:** waits for the register pages, later in Phase 1.~~ Done in T-107's follow-up: the screen links to the Committee register, where a person's details are corrected in their unit's register.
- **T-095 The access check screen (brief 25 A4).**
  - **Screen:** `/admin/access-and-permissions/access-check`. Choose a person by name. The screen shows whether they are a system administrator, their current terms, and every capability they hold today, each with its scope, unit ("Portal-wide" when no term gives it) and source.
  - **Read-only:** it shows permissions, never the person's data, and nothing on it acts as them.
  - **Shared code:**
    - `AccessGrant` and `AccessCheck` moved to `src/shared/administration-panel/access-check.ts`;
    - `capabilityName` moved up to `src/web/features/administration-panel/`, shared by the matrix and this screen.
- **T-096 The units screen (brief 25 B1, 14 A1).**
  - **Screen:** `/admin/organisation/units`, listed for holders of `committee-register.branches.manage` (the national register officer's fixed rule). It shows each unit's name in the officer's language, code, area and status.
  - **Editing:** a unit can be edited in place, and a branch added.
    - The General Council's form has no area or status (the server refuses both).
    - A new branch's status starts unchosen, so the officer picks it.
  - **Shared type:** `UnitRecord` moved to `src/shared/committee-register/unit-record.ts`.
  - **Not yet:** the letterhead address and calendar colour (deferred, see T-080).
  - **Reaching the screen:** a national register officer who isn't a system administrator can't open the admin area (D-021). Asked as O-028.
- **T-097 The roles screen (brief 25 B2, 14 B2).**
  - **Screen:** `/admin/organisation/roles`, listed to holders of `committee-register.standard-roles.manage` or `administration-panel.role-designations.manage`. Each section appears only to holders of its own capability:
    - **Standard roles:** list, rename in place, add, with names in both languages and each role's designation shown.
    - **Designations:** one choice per designation, among the standard roles, or none.
  - **Stage page:** `ADMIN_SCREENS` entries now list the capabilities their APIs check, and a screen is listed to anyone holding any of them.
  - **Shared code:**
    - `TextField` moved to `src/web/components/`;
    - `RoleRecord` and `RoleDesignationsView` moved to `src/shared/`.
  - **Not yet:** "whether branches may add extra roles" (the setting `committee-register.branches_may_add_roles`). Asked as O-029.
- **T-098 The lists screen (brief 25 B3).**
  - **Screen:** `/admin/organisation/lists`. Each of the five lists is shown under its own heading, with its items renamed in place and a new item added. A refusal shows beside the list it concerns. The archive categories are shown as fixed, with nothing to change them.
  - **Not yet:** removing and ordering items wait on O-026 and O-027.
  - **Shared code:**
    - `BilingualNameForm` and `RenamableItem` in `src/web/components/`, with their labels in `portalShell.bilingualName`, used by both roles and lists;
    - the roles screen's own row and form were replaced by them.
  - **Arabic drafts:** aligned with the terms already used: عضو اللجنة for officer, دور for role, فترات العضوية for terms, سجلّ اللجان for the register.
- **T-099 The set-up checklist screen (brief 25 C6).**
  - **Screen:** `/admin/configuration/setup-checklist`. It shows each item waiting, grouped by service in the brief's order, or says nothing is waiting. A missing designation links to the roles screen; the privacy notice and settings screens come in Phase 2 (25 C1, C5), so those items are text only for now.
  - **Setting names:** every registered setting now has an on-screen name in both languages, in its service's text file (`settings`), looked up like capability names. A test (`tests/core/settings/setting-texts.test.ts`) keeps the names and the registry in step.
  - **Shared type:** `ChecklistItem` moved to `src/shared/administration-panel/setup-checklist.ts`.
  - **Gap found:** asked as O-030.
    - Adding a person, including the seed loader, waits until "Language new officers start with" is set.
    - Only the Service settings screen (25 C1, Phase 2) sets settings.
- **T-100 The two remaining Committee register settings (brief 14), registered with no default.**
  - **`committee-register.terms_ending_soon_window_days`:** a whole number of days, more than zero. A term whose end date falls within it is highlighted as ending soon (14 B3). Until it is set, nothing is highlighted and the register says the window isn't set. Days is my choice of unit, listed for the owner in the phase report.
  - **`committee-register.roles_requiring_mfa`:** a list of role ids. Anyone holding a current term in a listed role gets the `second-factor-required` state, exactly as system administrators do (T-077). Until it is set, only system administrators must (6.3: "System administrators always must").
  - **Both:** not required, and portal-wide with no unit override, like the other two register settings. Set on Service settings (25 C1, Phase 2).
  - **The second-factor page** now says "Your access requires two-step verification" rather than naming system administrators only.
- **T-101 Terms ending soon, marked by the server (brief 14 B3).**
  - **The mark:** `GET …/units/:unitId/officers` now gives each current officer `endingSoon`. It is true when the term's end date is on or before today (Europe/London) plus the window's days, false otherwise, and null for everyone while the window isn't set.
  - **Shared code:**
    - the date arithmetic is `addDaysToDate` in `src/shared/core/`;
    - `OfficerRecord` and `CurrentOfficerRecord` are in `src/shared/committee-register/officer-record.ts`.
- **T-102 The units whose register an officer may open (brief 14).** `GET /api/committee-register/units` (sweep entry: `committee-register.register.read`) lists the units that pass the same check as every register read: `register.read` or `officers.manage` for that unit. A branch register officer gets their own branch; the national register officer every unit; anyone else nothing. Other units' names are never sent. The register pages pick their unit from this list, since the portal's unit switcher only holds units where the person has a term.
- **T-103 The register pages in the portal: officers and past officers (brief 14 B1, B3, C3).**
  - **Pages:**
    - `/committee-register` opens the unit selected in the portal if the officer may read its register, otherwise their first;
    - `/committee-register/:unitId/<view>` shows one unit's register, with a unit choice (T-102) and a view per brief section, each offered by capability hint.
  - **Officers:** each current or upcoming term shows the name, role, email, phone and dates. A term ending within the window is highlighted, with an "Ending soon" label, and the page says when the window isn't set.
  - **Changes, for those who manage the register of an active unit:**
    - add an officer: name, email, phone, a role the unit can use, start date, and an optional end date;
    - correct a name or phone;
    - end a term.

    Each change reports its outcome: whether the invitation was sent, and whether ending the last term locked the account.
  - **Past officers:** name, role and dates only, as C3 describes; no contact details.
  - **An inactive branch:** its register says it is read-only and offers no changes (P4).
  - **Shared code:** `TextField` now takes a type (text, email, phone, date) and can be optional.
- **T-104 The register's Roles view (brief 14 B2).** It lists the standard roles read-only, then the branch's own roles, renamed in place and added. It is offered to holders of `branch-roles.manage`.
  - Changes appear only for an active branch: the General Council has no extra roles, and an inactive branch is read-only.
  - Adding waits, with its reason shown, while "Branches may add extra roles" isn't set (O-029), and is refused while it is "no".
- **T-105 The register's Elections view (brief 14 C1; P3; D-055, D-066, D-068).**
  - **The list:** the unit's elections, newest first, each with its date, status and whether it is a correction. Those who record elections can start a Draft, optionally as the correction of one of the unit's confirmed elections.
  - **One election** (`…/elections/:electionId`) shows its positions (role and seats), candidates, votes and who was elected.
  - **While it is a Draft, those who record elections can:**
    - add and remove positions (a role the unit uses, with its seats);
    - add and remove candidates: someone from the unit's officers or past officers, or someone new (P3);
    - save every candidate's votes and whether they were elected.
  - **Confirming** is for those with `elections.confirm`. The start date begins as the election date (D-066: "defaulting to the election date"). A required tick box ("I have checked the results") comes before confirming, because confirming locks the election. Once Confirmed, the page is read-only and says a correction is a new election.
  - **API:** each position now carries its role's names, so readers without the role list can see them. `ElectionRecord` and its parts moved to `src/shared/committee-register/election-record.ts`.
- **T-106 Handovers: names, and the officers' own list (brief 14 C2, D-067).**
  - **Names:** each handover now carries its unit's, role's and both officers' names.
  - **The officers' own list:** `GET /api/committee-register/my-handovers` (sweep entry: `committee-register.handovers.confirm`) lists the handovers the person is named on, in any unit, where they may take part (`handovers.confirm` for that unit) or manage (`handovers.manage`).
    - It is how an outgoing or incoming officer reaches the handover they confirm, since they may not be able to read the unit's register.
    - It lists nothing to anyone else.
  - **Shared types:** `HandoverRecord` and `HandoverItem` moved to `src/shared/committee-register/handover-record.ts`.
- **T-107 The register's Handovers view (brief 14 C2, D-067).**
  - **The unit's handovers:** each shows the role, the outgoing and incoming officers, and whether it is open, being confirmed, or complete. Those who manage handovers of an active unit can set one up: a role the unit uses, and two people who hold or have held a term in it. The new handover then opens.
  - **One handover** (`/committee-register/handovers/:handoverId`, outside any unit's page, so the named officers can reach it) shows each officer's confirmation with its date and time, and the checklist.
  - **While it is open:**
    - the named officers and those who manage handovers can tick items;
    - those who manage handovers can add and remove items.
  - **Confirming:** each named officer confirms once, after a required tick box. The first confirmation fixes the checklist; the second completes and locks it.
  - **Reaching them:** "Handovers you take part in" (`/committee-register/my-handovers`, T-106) is linked from the register for holders of `handovers.confirm`, including when they have no register to open.
  - **Shared code:**
    - `RefusalAlert` is now one component in `src/web/components/`;
    - the list of people who hold or have held a term in a unit is one hook, used by candidates and handovers.
- **T-108 The seed loader (brief 26 Phase 1, `docs/seed-files.md`, D-062).**
  - **Commands:** plain TypeScript in `scripts/seed/`, run by Node 24 directly, so no new dependency.
    - `npm run seed:load -- --target local|preview` checks everything and shows what it would load. Only `--apply` writes. Production is never a target.
    - `npm run seed:invitations` lists each person who would be invited, by name and email, and sends nothing.
  - **Checks before anything is written:** every rule in `docs/seed-files.md`, all five files at once, so every problem is reported together. A missing file is reported on its own. Beyond the spec's own rules, two follow the portal's:
    - no term in an inactive branch (P4, as the portal refuses);
    - no one holding the same role in the same unit twice (P5, as the portal refuses).
  - **Checks on the target:** its register must be empty, since the seed is the first data and never loads twice. "Language new officers start with" must be set, as for anyone added in the portal (brief 8.5, rule 5; O-030).
  - **What it writes:** units, standard roles, people (no Clerk link), terms, system administrators and the first privacy notice, as one file of SQL run by `wrangler d1 execute`.
  - **D-062 enforced:** `tests/structure/seed/seed-sends-nothing.test.ts` follows every import of both commands: static, side-effect and dynamic imports, and re-exports. It fails if any reaches Clerk's SDK, the Worker's Clerk adapter or the invitations service. It was shown failing for each of those four ways of reaching a sender, then passing once the loader was restored.
  - **Tested against the real schema:** `tests/integrity/seed-sql.test.ts` loads the spec's fictional examples into D1. It checks the counts, that no invitation was recorded, that Arabic and the notice are kept exactly, and that a seeded administrator is active once linked.
  - **Worker tsconfig:** `allowImportingTsExtensions` is on, as it already was for Node, because the scripts' `.ts` import paths are what Node needs.
  - **Not built:** sending the invitations. Answered by D-075: the first people are invited from Clerk's dashboard, and `npm run seed:invitations` still lists exactly who.
- **T-109 The admin area opens for any administration capability (D-072), and the capability hint includes fixed grants.**
  - **Found while fixing D-072:** the request context's capability hint (T-042) listed only matrix grants. So a register officer's fixed powers (brief 7.3) weren't hinted, and their screens hid what the server allows. The server was always right: `can()` decides every request.
  - **The hint now uses the same split as `can()`** (`core/permissions/held-capabilities.ts`): a fixed capability comes only from a designated role, a matrix one only from the matrix. An uncatalogued capability is left out, since `can()` refuses those.
  - **The admin area** (`src/web/app/admin/admin-area-access.ts`) opens for anyone holding an Administration panel capability or the capability of any admin screen. Its stage navigation and stage pages show only the stages and screens they hold.
  - **The owner's proof:** `tests/web/app/admin/admin-area-access.test.tsx` renders the admin area for a national register officer's capabilities, read from the catalogue, with no Administration panel capability. It shows only Organisation, with Units and Roles. No route changed, so the sweep has no new entry.
- **T-110 "Branches may add extra roles" on the Roles screen (D-073).**
  - **Routes:** `GET` and `PUT /api/committee-register/branch-roles-allowed`, with sweep entries. They check `committee-register.standard-roles.manage`, the national register officer's fixed capability that maintains the standard roles.
  - **Recording:** the value is written through `setSetting`, so it keeps its history and audit entry (brief 8.1), and it will also appear on Service settings in Phase 2.
  - **On screen:** above the standard roles, a yes/no choice with neither ticked while it isn't set, saying branches can't add roles until it is chosen (rule 5).
- **T-111 The set-up checklist sets required settings (D-074).**
  - **New capability:** `administration-panel.setup-checklist.manage`. System administrators hold it (D-046), and the matrix can grant it. `docs/permissions.md` is regenerated.
  - **Route:** `PUT /api/administration-panel/setup-checklist/settings/:key` (sweep entry). It sets the portal-wide value through `setSetting`, so the setting's own schema checks it and it keeps history and audit.
  - **Only while it waits:** it takes only a required setting that isn't configured yet. A value already set is changed on Service settings (25 C1, Phase 2).
  - **On screen:** each waiting setting item on the checklist gets a field, built from the setting's registered schema (`describeSettingInput`): a choice with each option named in both languages, yes or no, or a whole number. Nothing is preselected (rule 5). A shape the checklist can't show (a list, for example) waits for Service settings.
  - **Option names:** in `settingOptions` in the Administration panel texts. A test fails if any choice setting's option has no name.
  - **So now:** the language new officers start with can be set before the seed loads, with nothing in the seed files.
- **T-112 Lists: retired, ordered, and the calendar colours (D-070, D-071, D-076).**
  - **Migration 0023** rebuilds `list_items`, keeping every row. It adds `position` (each list numbered in the order its items were added, the order shown until then), `retired_at` and `colour`, and allows the new list `calendar-colours`. A trigger refuses any delete. `roles.position` and the units' letterhead and colour columns come in the same migration.
  - **Migration 0024:** D1 refused 0023's colour check ("GLOB pattern too complex"). 0023 was already applied locally, so it isn't edited; 0024 rebuilds the table once more with the same rule in simpler parts. Both reach the preview together.
  - **Retiring** (`POST …/lists/:list/items/:itemId/retire`) hides an item from new choices and keeps it, so past records still read. Retiring can't be undone, so the screen asks once more first. A handover's checklist takes only items that aren't retired. Names stay unique with retired items included.
  - **Order** (`PUT …/lists/:list/order`) takes every item of the list exactly once, and sets their positions in one batch. A new item goes last, with its position worked out in SQL. The screen moves an item one place up or down.
  - **Calendar colours:** a sixth list on the Lists screen. Each item has names in both languages and a colour, typed as `#RRGGBB` with a swatch; nothing is preselected, since a native colour picker would start on black. The service, the request schema and a database check all hold "a calendar colour has a colour; nothing else does".
  - **Sweep entries** were added for both routes.

## Open

O-002, O-005 (build-order half), O-006, O-008 (visibility half) were answered on 2026-09-22 — see D-017, D-019, D-020, D-021. O-003, O-004, O-007 (a)/(b) and O-009 were answered for real on 2026-09-22, this time — see D-023 to D-026. O-010, O-011 and O-012 — found while acting on those answers — were also answered on 2026-09-22, the same day: see D-027 to D-029. O-013, O-014, O-015 and O-016 were answered 2026-09-23 — see D-030 to D-033, though O-016's own remainder (below) stays open the same way O-007's did. O-007's digits part and O-005's remainder stay open below.

**2026-09-24:** O-005, O-007, O-016, O-017 and O-021 to O-024 answered (D-048 to D-055); O-025 answered (D-063). **2026-09-25:** O-026 to O-032 answered (D-070 to D-076).

| # | What is needed | Blocks |
|---|---|---|
