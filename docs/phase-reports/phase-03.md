# Phase 3 report: Documents archive and Resources library

**Status:** built; waiting for the owner's approval.

- **Started:** 2026-09-26, when Phase 2 was approved (D-094).
- **Scope** (brief section 26, Phase 3): "The shared file layer and `fileRecord()`. Library D2 and D3 structures exist, populated in Phase 10."
  - Service 13, Documents archive (brief 15).
  - Service 6, Resources library (brief 16).
  - The file layer itself was built in Phase 2 (D-087).

**Before starting:**
- **P-items:** P2, P19 and P20, confirmed 2026-09-26 (D-095).
- **Owner inputs:** none for Phase 3 in brief 30.
- **Questions:** O-043 to O-049 were asked and answered (D-096 to D-102), then O-050 to O-058 (D-103 to D-112).

**Preview:** CI deploys each passing commit and applies its migrations. Checked 2026-09-26: the preview database has no migration waiting (0028 to 0033 applied).

## 1. What was built, by sub-point

### Documents archive (brief 15)

| # | Built | Where recorded |
|---|---|---|
| A1 Automatic filing | `fileRecord()`, exported from `documents-archive/index.ts`. It returns the statements for the calling service's own batch: the document and its one version, with the record's own date as the document date. The file must already be locked; the service and a trigger both check. Each record is filed once. Its callers come in Phases 4 to 12. | T-126 |
| A2 Upload | An official document goes into Governance or General only, with an optional description and the document's own date (D-096, D-097). The file is recorded locked, with the document and an audit entry, in one batch. An inactive branch's archive is read-only (P4). | T-127 |
| A3 Categories | The six fixed categories (Phase 0's locked data). An automatic filing goes into the category its service gives; an upload is refused anywhere else, in the service and by a check. | T-126, T-127 |
| A4 Versions | "Add a new version" on an uploaded document, each version with its own date (D-110). Every earlier version and file is kept. An automatic filing is locked: it gets no second version (service and trigger). | T-130 |
| A5 National and branch | A branch sees its own documents and the General Council's; the General Council sees every branch's (P2). A document outside that answers "not found". | T-127 |
| B1 Search | By title, category, branch, and either the document date or the filing date, from and to. A document matches when any of its versions is dated in the range. | T-127, T-130 |
| B2 Download | Any version of any document the officer may see: streamed, or through a short-lived link for a large file. | T-127 |

**Brief 15's rules:**
- Nothing in the archive can be changed or deleted, and there is no delete endpoint. Triggers refuse any update or delete, on documents and versions alike.
- The archive can't be switched off (8.4).

### Resources library (brief 16)

| # | Built | Where recorded |
|---|---|---|
| A1 Templates, A2 Guides | Each is a file with a title, an optional description and the file's language (D-103). Details can be changed; replacing the file keeps the old one, no longer shown (D-104). Retired and brought back, never deleted (D-100). | T-131 |
| A3 National and branch | The General Council's are listed to every branch; a branch's only to that branch. Only the owning unit changes its own. | T-131 |
| B1 Venues | Only the name is required. The other details: address, capacity, facilities, the contact person's name, phone and email, and the typical cost in pounds (stored as pence) with a note of what it covers (D-105). General Council venues are shared (D-106). Notes are dated and show who wrote them; a note can't be changed, only retired, with who and when recorded (D-098, D-107). | T-131 |
| C1 Equipment | Item, quantity, where it is kept and its condition (from the 15 B3 list). The quantity can never go below what is out on loan (D-108). General Council equipment is shared (D-106). | T-131 |
| C2 Loans | Borrower, quantity, the date borrowed (today by default) and the date due back (P20, D-099). No loan for more than is left, and the refusal states the numbers (D-108). A loan can be corrected until its return is recorded, and every state is kept (D-109). The screen shows what is out on loan now. | T-131 |
| D1 Letter templates | Title, an optional subject, the letter text, the author's own fields, and English or Arabic (P19, D-101, D-112). A live preview shows the template on the unit's letterhead with the fields as placeholders (D-102), and "Preview PDF" renders it with the real logo (D-111). Stale saves are refused; templates are retired, never deleted. | T-128, T-129 |
| D2 Letters out, D3 Letters in | The tables, and `fileLetter()` for the Correspondence service (Phase 10). The screens are read-only, with downloads, for the unit's own officers only (7.3). Nothing filed can be changed or deleted. | T-126, T-128 |

**Brief 16's rules:**
- Venues and equipment are reference only; there is no booking.
- Event templates aren't here.
- Correspondence sits in the library's own section.
- Loans link to no other service.
- The library is hidden, and its routes answer "not found", where it is switched off (8.4).

**Screens:**
- **Documents archive:** search with results, a document page with versions and downloads, uploads and new versions.
- **Resources library:** Templates, Guides, Venues, Equipment, Letter templates, Letters out and Letters in, in brief 16's order.
- **Texts:** every text is in English and Arabic. The Arabic ones are drafts for the owner's review (`docs/arabic-texts-review.md`).

## 2. Test and lint results

At commit `ba67eac`, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 587 pass, none skipped (514 at the end of Phase 2).
- **Permission sweep:** passes. Every new route has its sweep entry.
- **Build:** passes.

**New immutability tests:**
- **Archive:** documents and versions can't be changed or deleted, an automatic filing gets no second version, and nothing unlocked can be filed.
- **Library:** filed letters can't be changed or deleted. Letter templates, templates and guides, venues, equipment and loans can't be deleted.
- **Venue notes:** can't be changed, only retired, once.
- **Loans:** a returned loan can't change, and a loan's history can't be changed or deleted.
- **Stock rules** (enforced in the database): nothing is lent beyond what is left, and no item's quantity goes below what is out.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-095:** P2, P19 and P20 confirmed.
- **D-096 to D-102 (O-043 to O-049):**
  - Archive uploads have an optional description and go into Governance and General only.
  - Documents have a document date and a filing date.
  - Venue notes are dated.
  - Loans cover a quantity, have a due-back date and a recorded return, and the screen shows what is out.
  - Library material is retired, never deleted.
  - The author writes a template's fields.
  - The preview is on the real letterhead.
- **D-103 to D-112 (O-050 to O-058):**
  - Templates' and guides' details are a title, description and language; replaced files are kept.
  - Only a venue's name is required.
  - General Council venues and equipment are shared.
  - Venue notes are retired, never changed.
  - Loans are refused beyond what is left, and can be corrected until returned.
  - An archive version has its own date.
  - Letter templates get "Preview PDF", and the subject is optional.
  - T-128's three choices are confirmed.

## 4. Uncertain or not finished

**To check on the preview once the R2 keys are set** (uploads answer "file storage is not set up yet" until then):
1. An upload to the archive and to the library.
2. A download larger than the administrator's download-link size. It comes as a redirect to R2's short-lived link; the browser drops the session header when leaving the portal, and R2's rules allow GET from the portal (T-127).
3. "Preview PDF" for a letter template, which uses Browser Rendering, as the Branding screen does.

**Choices of mine, to confirm or change:**
- **Venue notes** can be retired but not brought back: D-107 describes retiring only (T-131).
- **Equipment:** all four C1 details are required (item, quantity, where kept, condition), and a retired item can't be lent (T-131).
- **Refusals** now carry figures beside their code, so a text can state the numbers (D-108).
- **Archive search** by document date matches any version's date. The list shows the latest version's date (T-130).

## 5. Questions for the owner, and what Phase 4 needs

**Question:**
- **O-059:** should branches also see who borrowed General Council equipment, and when? For now only the General Council sees its borrowers; branches see how many are out (T-131).

**Phase 4 (Treasury) needs P6 to P10 confirmed before it starts** (brief 31). Each will be restated in one line when Phase 3 is approved.

**Owner inputs:** brief 30 lists none for Phase 4. Opening balances come with the Phase 12 import.
