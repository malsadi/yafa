# Seed files for Phase 1

**Ready to write (2026-09-24).** Every column is final: O-017 and O-021 to O-023 are answered (D-051 to D-054).

The launch data Phase 1 loads (brief section 8.3). Only the owner supplies these files, in `seed/`, and Claude Code never invents a value. If a file is missing or incomplete, loading stops and says exactly what is missing. Nothing is loaded until all five files pass every check.

| File | What it holds |
|---|---|
| `seed/units.csv` | The General Council and the branches |
| `seed/roles.csv` | The standard roles, and the two register officer designations |
| `seed/people.csv` | The first system administrators and the national register officer, with their terms |
| `seed/privacy-notice-en.txt` | The first privacy notice, in English (D-051) |
| `seed/privacy-notice-ar.txt` | The first privacy notice, in Arabic (D-051) |

## Format

- **CSV files:** saved as **UTF-8** so Arabic text is kept exactly (Excel: *Save As → CSV UTF-8*). The **first row is the header**, spelled exactly as below. One record per row. Put a value in double quotes if it contains a comma.
- **Notice files:** plain text, UTF-8. Paragraphs are separated by a blank line and kept exactly as written.
- **Dates:** `YYYY-MM-DD`, for example `2026-01-15`.
- **Fixed values:** written exactly as listed.
- **Every example below is fictional.**

---

## 1. `seed/units.csv`

Exactly one `national` row (the General Council), and one `branch` row per branch.

| Column | Required | Values | Notes |
|---|---|---|---|
| `type` | yes | `national` or `branch` | |
| `code` | yes | letters, digits and hyphens; unique | Also used in letter reference numbers (brief 14 A1). Never reused by another unit. |
| `name_en` | yes | text | English name (D-054). |
| `name_ar` | yes | text | Arabic name (D-054). |
| `area` | branches only | text | Leave empty for the `national` row. |
| `status` | yes | `active` or `inactive` | An inactive branch is read-only (P4). The `national` row must be `active`. |

```csv
type,code,name_en,name_ar,area,status
national,GC,Example General Council,المجلس العام التجريبي,,active
branch,NTH,Example North Branch,الفرع الشمالي التجريبي,Northtown,active
branch,STH,Example South Branch,الفرع الجنوبي التجريبي,Southville,inactive
```

## 2. `seed/roles.csv`

The standard national roles (brief 14 B2). Branches add their own extra roles later, in the portal.

| Column | Required | Values | Notes |
|---|---|---|---|
| `name_en` | yes | text, unique | English name (D-052). |
| `name_ar` | yes | text, unique | Arabic name (D-052). |
| `designation` | no | `Branch register officer`, `National register officer`, or empty | Exactly one role carries each designation (brief 7.2, 15 B2). Leave empty for every other role. |

```csv
name_en,name_ar,designation
Chair,الرئيس,
Secretary,أمين السر,
Treasurer,أمين الصندوق,
Branch Register Officer,مسؤول سجل الفرع,Branch register officer
National Register Officer,مسؤول السجل الوطني,National register officer
```

## 3. `seed/people.csv`

**One row per term of office**: a person holding two terms has two rows with the same email (P5). Only the people brief section 30 asks for at launch. Every other officer is added in the portal or through the Phase 12 import. Clerk itself is never seeded. After loading, `npm run seed:invitations` lists exactly who to invite, and the owner invites them from Clerk's dashboard (D-075); each account links to its person by email at sign-up. Before loading, "Language new officers start with" must be set on the set-up checklist (D-074).

| Column | Required | Values | Notes |
|---|---|---|---|
| `email` | yes | an email address | Where the Clerk invitation goes, and how the account links (brief 6.2). Identifies the person across rows. |
| `name` | yes | text, as the person writes it | Stored exactly as typed, in either language (brief 8.5). The same on every row for one person. |
| `phone` | yes | text, as written | D-053. The same on every row for one person. |
| `system_administrator` | yes | `yes` or `no` | The same on every row for one person. At least two people must be `yes` (P21). |
| `role` | yes | a `name_en` from `roles.csv` | The role this term is for. |
| `unit_code` | yes | a `code` from `units.csv` | The unit this term is in. |
| `start_date` | yes | `YYYY-MM-DD` | A term gives no powers before this date (D-029). |
| `end_date` | no | `YYYY-MM-DD` or empty | Empty means current until it is ended (D-019). |

**The loader also checks that:**
- every system administrator has a current term, since without one nobody can reach the portal (D-027); and
- the national register officer's term is in the `national` unit, with the `National register officer` role.

```csv
email,name,phone,system_administrator,role,unit_code,start_date,end_date
ada.example@example.org,Ada Example,07700 900001,yes,Chair,GC,2026-01-15,
sami.example@example.org,Sami Example,07700 900002,yes,National Register Officer,GC,2026-01-15,
sami.example@example.org,Sami Example,07700 900002,yes,Secretary,NTH,2025-06-01,
```

Sami holds two current terms (P5): national register officer in the General Council, and Secretary of the North branch.

## 4. `seed/privacy-notice-en.txt` and `seed/privacy-notice-ar.txt`

The first privacy notice (D-051), which every officer, administrators included, reads and ticks at first sign-in (D-005, D-027). Brief section 13 requires it to say that Clerk stores identity data in the United States, and that the portal's own data is held in the EU. Both files are required, and neither may be empty. Later versions are entered in the Administration panel (15 C5).

---

**Not seeded in Phase 1:** other officers, past officers and opening balances. These come through the Phase 12 import (brief 15 D4).
