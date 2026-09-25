# Phase 1 report: Committee register and Administration access and organisation

**Status:** built, and waiting for the owner's review. The seed files haven't been supplied, so they aren't loaded yet. Started 2026-09-24 (D-041). Brief section 26, Phase 1:
- **Register:** units, people, terms, roles, role designations, elections, handovers, past officers, invitations.
- **Administration panel:** system administrators, officer accounts, permissions matrix, access check, units, roles, lists, set-up checklist.
- **Also:** load the owner's seed files, and deliver `docs/permissions.md`.

**Before starting:**
- **P-items:** P1, P3, P4, P5, P21 and P22 were confirmed (D-042).
- **Owner inputs:** the seed files, specified in `docs/seed-files.md`.

**Preview:** https://yafa-portal-preview.mohammedalsadi985.workers.dev. CI deploys each passing commit and applies its migrations. Checked 2026-09-25: the newest routes answer, and the preview database has no migration waiting.

## 1. What was built, by sub-point

### Committee register (brief 14)

| # | Built | Where recorded |
|---|---|---|
| A1 Branches | Name in English and Arabic, code, area, status. A national register officer adds and changes them; an inactive branch is read-only everywhere (P4). | T-080, T-081, T-096 |
| A2 Branch register officer | The designation "Branch register officer" on a standard role gives its holders the fixed register powers for their own branch. | T-074, T-075, T-083 |
| A3 National register officer | The same powers for every branch, plus branches and standard roles. | T-074, T-075 |
| B1 Officers and roles | Adding an officer with a term invites them to sign in. A known email adds a term to the same person (P5). Name and phone can be corrected. | T-085, T-086, T-103 |
| B2 Standard roles | The national list, plus a branch's own extra roles when the setting allows them. | T-082, T-097, T-104 |
| B3 Terms of office | Start and end dates. Terms ending within the window are highlighted, and the register says when the window isn't set. | T-085, T-100, T-101, T-103 |
| C1 Elections | A Draft holds positions with seats, candidates (including someone new, P3), votes and who was elected. Confirming it, in one batch, ends the outgoing terms and starts the new ones on the chosen date. A confirmed election is locked by the service and a trigger; a correction is a new election. | T-092, T-105; D-055, D-066, D-068 |
| C2 Handovers | The checklist starts from the handover items list. Each named officer confirms once; the handover is then locked when complete. The named officers reach their own handovers from "Handovers you take part in". | T-089, T-106, T-107; D-067 |
| C3 Past officers | Terms that have ended are kept with role and dates, and never deleted. | T-085, T-103 |
| Settings | Terms ending soon window, lock the account when the last term ends, roles requiring multi-factor authentication, and whether branches may add extra roles. None has a default. | T-084, T-087, T-100; D-063, D-065 |
| Invitations and accounts | Invitation on adding an officer. The five account states. Automatic lock after the last term, run daily at 00:15 UTC. | T-086, T-087; D-061, D-063, D-065 |

### Administration panel (brief 25)

| # | Screen | Where recorded |
|---|---|---|
| A1 System administrators | `/admin/access-and-permissions/system-administrators`: appoint from the General Council, remove. At least two always remain (P21: service and trigger). A second factor is required. | T-076, T-077, T-093 |
| A2 Officer accounts | Every person and their access state; resend invitation, lock or unlock, sign out of all sessions, remove push devices. Links to the register. | T-086, T-087, T-094 |
| A3 Permissions matrix | Roles × capabilities × scope. Fixed rules are shown locked; every change is versioned and restorable. | T-078, T-079 |
| A4 Access check | Choose a person to see their capabilities, scope, unit and source. It shows permissions only and never acts as them. | T-090, T-095 |
| B1 Units | `/admin/organisation/units`: the General Council and the branches, edited in place, and a branch added. Each unit takes a letterhead address in English and Arabic, and a calendar colour from the list (D-076). | T-096, T-114 |
| B2 Roles | The standard roles in the national register officer's order; whether branches may add roles of their own (D-073); and which role holds each register officer designation. | T-083, T-097, T-110, T-113 |
| B3 Lists | The five lists and the calendar colours: items added, renamed, put in order, and retired but never deleted (D-070, D-071). The archive categories are shown as fixed. | T-088, T-098, T-112 |
| C6 Set-up checklist | What is waiting, by service: the privacy notice, designations and required settings. A required setting is set right there (D-074). | T-091, T-099, T-111 |

### Also

- **`docs/permissions.md`:** generated from the capability catalogue and kept in step by a test (T-075).
- **The seed loader:** `npm run seed:load -- --target local|preview` checks all five files and every rule, and shows what it would load. It writes only with `--apply`, into an empty register. `npm run seed:invitations` lists who would be invited and sends nothing. A test proves neither command can reach anything that sends (D-062, T-108). **Not run:** the files aren't in `seed/` yet.
- **Removed at the owner's request:** the public progress page and everything that existed only for it (D-069).

## 2. Test and lint results

At commit `bfcd60a`, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including file-size and import-boundary rules.
- **Formatting:** passes.
- **Tests:** 447 pass, none skipped. They run in three projects: Worker, web and structure.
- **Permission sweep:** passes (7). Every new route has its sweep entry.
- **Build:** passes.

**Immutability tests cover:**
- confirmed elections: no change, no delete;
- completed handovers;
- system administrators: never fewer than two;
- invitations and the audit log: append-only;
- archive categories;
- list items: never deleted (D-070).

**Dependencies:** none added in Phase 1. The seed scripts run on Node 24's own TypeScript support.

## 3. Owner answers received and recorded

- **D-042 to D-068:** P-items, access for system administrators (D-046), seed questions (D-051 to D-055), units and roles in two languages, election rules (D-066, D-068), handovers (D-067), the job time (D-063, D-065), the Arabic name يافع (D-059), and the seed invitation rule (D-062).
- **D-069:** removing the progress page.
- **D-070 to D-077 (2026-09-25), all built:**

  | Answer | Built |
  |---|---|
  | D-070: list items are retired, never deleted | T-112 |
  | D-071: the administrator orders list items and roles | T-112, T-113 |
  | D-072: the admin area opens for any administration capability (a bug fix) | T-109 |
  | D-073: the national register officer sets "Branches may add extra roles" on the Roles screen | T-110 |
  | D-074: the set-up checklist sets required settings | T-111 |
  | D-075: the first people are invited from Clerk's dashboard | nothing to build |
  | D-076: letterhead address in two languages; calendar colours from a list | T-112, T-114 |
  | D-077: whole days, the confirmation tick box, and "Handovers you take part in" are kept | — |

## 4. Uncertain or not finished

- **Seed files:** not supplied, so not loaded. Before loading:
  1. set "Language new officers start with" on the set-up checklist (D-074);
  2. load the seed files;
  3. run `npm run seed:invitations`, which lists exactly who to invite;
  4. invite those people from Clerk's dashboard (D-075).
- **Found and fixed while building D-072:** the screens' capability hint left out the fixed register-officer grants, so their screens hid actions the server allows. The server always decided correctly (T-109).
- **Waiting on a later phase:**
  - revoking a calendar feed token (A2) waits for the calendar feed (Phase 6);
  - the privacy notice item on the checklist links nowhere until its screen exists (Phase 2);
  - a setting already set is changed on Service settings (Phase 2).
- **Choices of mine, to confirm or change:**
  - **Two extra seed checks:** no seeded term in an inactive branch, and no one holding the same role in a unit twice. Both follow what the portal itself refuses (T-108).
  - **Which roles are ordered:** I read D-071's "roles" as the standard roles; a branch's own roles aren't ordered (T-113).
  - **Retiring can't be undone:** a retired list item can't be brought back. D-070 doesn't mention restoring (T-112).
  - **Shared colours:** two units may share a calendar colour. D-076 wants branches distinguishable, but doesn't forbid a repeat (T-114).
  - **The new capability** `administration-panel.setup-checklist.manage` for setting required settings. System administrators hold it; the matrix can grant it (T-111).
- **Arabic texts:** every Arabic text on the new screens is a draft for your review (`docs/arabic-texts-review.md`).

## 5. Questions for the owner, and what Phase 2 needs

**Questions:** none open. The four choices above are yours to confirm or change.

**For your review:** the permissions matrix is yours to fill in at `/admin/access-and-permissions/permissions-matrix`. The brief says it is "entered in 15 A3 during Phase 1 review".

**Phase 2 (Administration configuration, 25 C1 to C5) needs:**
- **P23 confirmed:** the lawful basis for keeping officers' data permanently.
- **Branding:** logo, colours, fonts (Latin and Arabic) and the letterhead design, in English and Arabic.
- **Texts:** the privacy notice and the other texts, in English and Arabic.
