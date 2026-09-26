# Phase 3 report: Documents archive and Resources library (DRAFT, in progress)

**Status:** Phase 2 approved 2026-09-26 (D-094), and Phase 3 is current in CLAUDE.md.

**Brief section 26, Phase 3:** "The shared file layer and `fileRecord()`. Library D2 and D3 structures exist, populated in Phase 10." Services 13 (brief 15) and 6 (brief 16).

## Before starting (CLAUDE.md, "How every session works", step 3)

**P-items:** P2, P19 and P20, confirmed 2026-09-26 (D-095).

**Owner inputs:** none for Phase 3 in brief 30. The file layer is already built (Phase 2, D-087). Uploads on the preview wait for the owner's R2 token and secrets.

**Fixed by the brief (7.3):**
- **Archive:** General Council documents are visible to all branches; a branch's to that branch and the General Council.
- **Library:** General Council resources are shared with all branches; a branch's are for that branch only.
- **Letter templates:** national ones for all branches; a branch's for that branch only.
- **Who may do what:** the permissions matrix, filled by the data administrator.

**Questions before building (asked 2026-09-26):** O-043 to O-049 in `docs/decisions.md`, "Open".

**Answers received (2026-09-26):** D-096 to D-102.

## Built so far

- **Capabilities:** read and upload for the archive; read, and managing resources, venues, equipment and letter templates, plus reading correspondence, for the library. Each is own-unit; the data administrator assigns them in the permissions matrix.
- **`fileRecord()`:** files a finished record into the archive inside its service's own batch, with one version that is never changed. Nothing in the archive can be changed or deleted (T-126).
- **Archive, 15 A2, A3, A5, B1, B2** (T-127):
  - search by title, category, branch and either date;
  - open a document and download any version;
  - upload to Governance or General with an optional description and the document's own date.
  - Visibility follows 7.3 and P2.
- **Library D1, letter templates** (T-128): national and branch, written with the author's own fields, and previewed live on the unit's letterhead with the fields as placeholders. Stale saves are refused; templates are retired and brought back, never deleted.
- **Library D2 and D3** (T-126, T-128): Letters out and Letters in, filed only by `fileLetter()` and never changed or deleted. Shown read-only to the unit's own officers, with downloads. They're populated in Phase 10.
- **Everywhere:** the library is hidden where it is switched off, and an inactive branch is read-only (P4).

**Waiting for answers:**
- **O-050, O-051:** templates and guides (16 A1 to A3).
- **O-052 to O-054:** venues (16 B1).
- **O-053, O-055, O-056:** equipment and loans (16 C1, C2).
- **O-057:** new versions of an archive document (15 A4).
- **O-058:** a PDF preview for letter templates.

**Still to do after those:** the report's test results and final check against the brief.

**To check on the preview once the R2 keys are set:** an upload, and the download of a file above the download-link size, which comes as a redirect to R2 (T-127).
