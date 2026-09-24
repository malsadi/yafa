# Seed files for Phase 1

The launch data Phase 1 loads (brief section 8.3). Only the owner supplies these files, in `seed/`, and Claude Code never invents a value. If a file is missing or incomplete, loading stops and says what is missing.

## Format, for all three files

- **CSV**, saved as **UTF-8** so Arabic text is kept exactly. Excel: *Save As → CSV UTF-8*.
- The **first row is the header**, spelled exactly as below.
- One record per row. Put a value in double quotes if it contains a comma.
- **Dates:** `YYYY-MM-DD` (for example `2026-01-15`).
- **Fixed values** (`branch`, `yes`, and so on) are lower case, exactly as listed.
- **Every example row below is fictional.**

Fields marked **(depends on O-0xx)** change with your answers to those open questions. The rest of the file is fixed.

---

## 1. `seed/units.csv`: the General Council and the branches

Exactly one `national` row (the General Council), and one `branch` row per branch.

| Field | Required | Values | Notes |
|---|---|---|---|
| `type` | yes | `national` or `branch` | |
| `code` | yes | letters, digits, hyphens; unique | Also used in letter reference numbers (brief 14 A1). Can't be reused by another unit. |
| `name` | yes | text | **(depends on O-023)**: if names are in two languages, this becomes `name_en` and `name_ar`. |
| `area` | branches only | text | Leave empty for the `national` row. |
| `status` | yes | `active` or `inactive` | P4: an inactive branch is read-only. |

```csv
type,code,name,area,status
national,GC,Example General Council,,active
branch,NTH,Example North Branch,Northtown,active
branch,STH,Example South Branch,Southville,inactive
```

## 2. `seed/roles.csv`: the standard roles

The national list of roles (brief 14 B2). Branch extra roles are added later in the portal, not seeded. Exactly one role carries each designation (brief 7.2, 15 B2).

| Field | Required | Values | Notes |
|---|---|---|---|
| `name` | yes | text, unique | **(depends on O-021)**: if role names are in two languages, this becomes `name_en` and `name_ar`. |
| `designation` | no | `branch-register-officer`, `national-register-officer`, or empty | Marks the two roles with special powers. Leave empty for every other role. |

```csv
name,designation
Chair,
Secretary,
Treasurer,
Branch Register Officer,branch-register-officer
National Register Officer,national-register-officer
```

## 3. `seed/people.csv`: the first system administrators and the national register officer

**One row per term of office**, so a person holding two terms has two rows with the same email (P5). Only the people the brief asks for at launch (brief section 30); all other officers are imported in Phase 12 or added in the portal. They're invited to sign in through the portal once Phase 1's invitations work; Clerk is never seeded.

| Field | Required | Values | Notes |
|---|---|---|---|
| `email` | yes | an email address | The address the Clerk invitation goes to, and how the account links (brief 6.2). Identifies the person across rows. |
| `name` | yes | text, as the person writes it | Stored exactly as typed, in either language (brief 8.5). The same on every row for one person. |
| `phone` | **(depends on O-022)** | text | Only if the register holds phone numbers. Other contact fields are added the same way. |
| `system_administrator` | yes | `yes` or `no` | The same on every row for one person. **At least two people must be `yes`** (P21). |
| `role` | yes | a `name` from `roles.csv` | The role this term is for. |
| `unit_code` | yes | a `code` from `units.csv` | The unit this term is in. |
| `start_date` | yes | `YYYY-MM-DD` | A term gives no powers before its start date (D-029). |
| `end_date` | no | `YYYY-MM-DD` or empty | Empty means current until it is ended (D-019). |

**Rules the loader checks:**
- Every system administrator has at least one current term, since otherwise they couldn't reach the portal at all (D-027). They normally hold their term in the General Council unit.
- The national register officer is a term with the `national-register-officer` role in the `national` unit.

```csv
email,name,system_administrator,role,unit_code,start_date,end_date
ada.example@example.org,Ada Example,yes,Chair,GC,2026-01-15,
sami.example@example.org,Sami Example,yes,National Register Officer,GC,2026-01-15,
sami.example@example.org,Sami Example,yes,Secretary,NTH,2025-06-01,
```

In this example, Sami holds two current terms (P5): national register officer in the General Council, and Secretary in the North branch.

---

**Not seeded in Phase 1:** officers beyond the ones above, past officers and opening balances. These come through the Phase 12 import (brief 15 D4).
