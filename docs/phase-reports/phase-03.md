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

The three parts that don't wait on anything else:
- **Capabilities:** read and upload for the archive; read, and managing resources, venues, equipment and letter templates, plus reading correspondence, for the library. Each is own-unit, and the data administrator assigns them in the permissions matrix.
- **`fileRecord()`:** files a finished record into the archive inside its service's own batch, with one version that is never changed. Nothing in the archive can be changed or deleted (T-126).
- **Library D2 and D3:** Letters out and Letters in, filed only by `fileLetter()`, and never changed or deleted. They're populated in Phase 10.

**Still to build:** the archive and library screens and routes, their permission sweep entries, and the report.
