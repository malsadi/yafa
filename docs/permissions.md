# Capability catalogue

Every capability the portal checks, with its meaning and the scopes a grant may be made at (brief section 7.2). The code checks capabilities, never role names. Which role holds which capability is data: the permissions matrix, filled in by the data administrator in the Administration panel (15 A3). The only exceptions are the fixed rules of brief section 7.3, which the code decides by role designation and the matrix shows locked.

Scopes: **own unit** (the unit of the term that gives the capability), **all units**, **national content**.

Generated from `src/shared/*/capabilities.ts`. Do not edit by hand: run `npm run permissions-doc`.

## Committee register

| Capability | Meaning | Scopes | Who holds it |
|---|---|---|---|
| `committee-register.branches.manage` | **Add or change branches.** Add a branch and change a branch's name, code, area and status (14 A1, 15 B1). Fixed: the national register officer alone. | all units | **Fixed** (brief 7.3): National register officer (all units). Locked in the matrix. |
| `committee-register.standard-roles.manage` | **Maintain the standard roles.** Keep the national list of roles used by every branch (14 B2, 15 B2). Fixed: the national register officer alone. | all units | **Fixed** (brief 7.3): National register officer (all units). Locked in the matrix. |
| `committee-register.branch-roles.manage` | **Add a branch's extra roles.** Add roles of a branch's own beyond the standard list (14 B2). Fixed: a branch register officer for their own branch; the national register officer for every branch. | own unit, all units | **Fixed** (brief 7.3): Branch register officer (own unit); National register officer (all units). Locked in the matrix. |
| `committee-register.officers.manage` | **Manage officers and terms.** Add officers and invite them, record and end terms of office, and keep past officers (14 A2, B1, B3, C3). Fixed: a branch register officer for their own branch; the national register officer for every branch. | own unit, all units | **Fixed** (brief 7.3): Branch register officer (own unit); National register officer (all units). Locked in the matrix. |
| `committee-register.elections.manage` | **Record elections.** Record an election's date, positions, candidates, results and vote counts (14 C1, D-055). Fixed: a branch register officer for their own branch; the national register officer for every branch. | own unit, all units | **Fixed** (brief 7.3): Branch register officer (own unit); National register officer (all units). Locked in the matrix. |
| `committee-register.elections.confirm` | **Confirm election results.** Confirm an election's results, which ends the outgoing terms and starts the incoming ones (14 C1). Granted in the permissions matrix (brief 14 build notes). | own unit, all units | The permissions matrix. |
| `committee-register.handovers.manage` | **Set up handovers.** Set up a handover between an outgoing and an incoming officer, with its checklist (14 C2). Fixed: a branch register officer for their own branch; the national register officer for every branch. | own unit, all units | **Fixed** (brief 7.3): Branch register officer (own unit); National register officer (all units). Locked in the matrix. |
| `committee-register.handovers.confirm` | **Take part in a handover.** Tick off and confirm a handover as its named outgoing or incoming officer (14 C2, D-067). Granted in the permissions matrix; only the officers named on a handover can confirm it. | own unit, all units | The permissions matrix. |
| `committee-register.register.read` | **Read the register.** Read a unit's register, including officers' contact details (brief 13: contact details are shown only to officers who may read the register). Granted in the permissions matrix. | own unit, all units | The permissions matrix. |

## Administration panel

| Capability | Meaning | Scopes | Who holds it |
|---|---|---|---|
| `administration-panel.system-administrators.manage` | **Appoint and remove system administrators.** Appoint and remove system administrators (25 A1). At least two always remain (P21). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.officer-accounts.manage` | **Manage officer accounts.** See every person's access state; resend an invitation, lock or unlock, sign out of all sessions, revoke a calendar feed token, remove push devices (25 A2). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.permissions-matrix.manage` | **Edit the permissions matrix.** Grant capabilities to roles at a scope; every change versioned and restorable. Fixed rules shown locked (25 A3). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.access-check.read` | **Use the access check.** See exactly which capabilities and scopes an officer has: permissions only, never their data, no impersonation (25 A4). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.role-designations.manage` | **Designate the register officer roles.** Choose which role is the branch register officer role and which is the national register officer role (7.2, 25 B2). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.lists.manage` | **Manage lists.** Event types, meeting types, achievement categories, equipment conditions and handover checklist items (8.2, 25 B3). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.service-settings.manage` | **Manage service settings.** Every registered setting, by service: national value and unit overrides where allowed, with history and restore (25 C1, 8.1). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.setup-checklist.manage` | **Set required settings from the set-up checklist.** Set a required setting that is not yet configured, from the set-up checklist (25 C6, D-074). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
| `administration-panel.setup-checklist.read` | **See the set-up checklist.** Every required setting, list and designation not yet configured, per service and unit (25 C6). | all units | System administrators always (D-046); anyone else through the permissions matrix. |
