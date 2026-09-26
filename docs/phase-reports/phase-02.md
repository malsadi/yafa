# Phase 2 report: Administration configuration

**Status:** approved 2026-09-26 (D-094).
- **Started:** 2026-09-25, when Phase 1 was approved (D-078).
- **Scope** (brief section 26, Phase 2): "Settings screens from the registry, service switches, branding and letterhead with PDF preview, notification defaults, texts" (brief 25 C1 to C5).
- **Added by the owner:** the file layer of brief 9.3, brought forward from Phase 3 (D-087).

**Before starting:**
- **P-items:** P23, confirmed 2026-09-25 (D-079).
- **Owner inputs** (brief 30: logo, colours, fonts, letterhead, texts): entered on these screens by the data administrator, so building didn't wait for them.

**Preview:** https://yafa-portal-preview.mohammedalsadi985.workers.dev. CI deploys each passing commit and applies its migrations. Checked 2026-09-26: the preview database has no migration waiting.

## 1. What was built, by sub-point

| # | Built | Where recorded |
|---|---|---|
| C1 Service settings | `/admin/configuration/service-settings`: every registered setting by service, with its value or "Not set". It can be changed, with unit overrides where a setting allows them, its history, and any earlier value restored. One editor handles choices, several choices, yes/no, whole numbers and roles; settings entered elsewhere point to their screen. | T-116 |
| C2 Service switches | `/admin/configuration/service-switches`: each service on or off portal-wide, and per unit (on, off, or follow portal-wide). The checks judge the state a change would leave in every place it reaches, so a dependency is never broken and a service never turns on before its set-up is complete. Switching deletes nothing. | T-117 |
| C3 Branding and letterhead | `/admin/configuration/branding`. See the list below. | T-120, T-123, T-124 |
| C4 Notifications | `/admin/configuration/notifications`: the alert types new officers start with (national circulars always on), and the iPhone install guide in both languages. Both are required before the Communication hub can be switched on (D-086). | T-118, T-121 |
| C5 Texts | `/admin/configuration/texts`: the privacy notice (each change a new version that every officer reads again), the "access not active" message, and the help text. The latter two show on their pages; the help text is on a new Help page in the footer. | T-119 |

**C3 in detail:**
- **Name and colours:** the organisation name in English and Arabic. The main and accent colours are each refused below normal reading contrast against white, taken as WCAG AA, 4.5:1 (D-082). They are used for headings and rules on the portal's screens as well as the documents.
- **Files:** the logo; the square icon, uploaded once and made into the two sizes phones need, each checked as a square PNG; and the Latin and Arabic font files, used on screens and in PDFs (D-080, D-084).
- **Public files:** the install file, its two icons and the two fonts are the only files served without a sign-in, each declared with its own access class. A test proves nothing else can be reached (D-088).
- **Letterhead:** one fixed design with the logo left, centre or right, mirrored in Arabic, and a signature block with a space to sign (D-081, D-089). A free on-screen preview follows every change as it is made; a PDF renders only on "Preview PDF" (D-090).

**The file layer (brief 9.3; D-087), T-122:**
- **The record:** the `files` table. A locked file can never be changed or deleted.
- **Rules per use:** each use's allowed types and size limit, set by the administrator.
- **Uploads:** a short-lived signed link sends the file straight to R2, in parts over 10 MB. A "complete" step records only an object that fits its use: R2 first, then D1.
- **Downloads:** streamed, or sent as a short-lived link above the administrator's size.
- **In the browser:** photos are resized to JPEG on the device.
- **Clean-up:** the nightly job removes objects with no record.

**Which parts of Phase 3 this covers (D-087):**
- **Already built:** everything in brief 9.3: the `files` table and its lock, uploads and downloads, the per-use rules, photo resizing, and the orphan clean-up.
- **Left for Phase 3:** its own records and screens. That means `fileRecord()` for filing records into the archive, the archive and library uploads and downloads (built on this layer), and the D2/D3 library structures.

## 2. Test and lint results

At commit `84e4343`, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including file-size and import-boundary rules.
- **Formatting:** passes.
- **Tests:** 514 pass, none skipped.
- **Permission sweep:** passes (7). Every new route has its entry, including the three new public classes.
- **Build:** passes.

**New immutability tests:**
- a locked file's record can't be changed or deleted;
- a list item is never deleted;
- privacy notice versions stay append-only (Phase 0's trigger).

**Dependencies:** none added. The upload signing uses `aws4fetch`, a dependency since Phase 0, which runs on Workers.

## 3. Owner answers received and recorded

- **D-078:** Phase 1 approved, with its two changes: a retired list item can be brought back, and no two units share a calendar colour.
- **D-079:** P23 confirmed.
- **D-080 to D-084:**
  - fonts are uploaded;
  - one fixed letterhead design;
  - a main and an accent colour, on PDFs and screens, readable on white;
  - one help text per language on a Help page;
  - a separate square icon.
- **D-085, D-086:** the alert types and the iPhone install guide are both required.
- **D-087 to D-090:** the file layer now; only the install file, icons and fonts are public, each with its own class; the logo mirrored in Arabic and a signature space with no image; a free preview, and a PDF only on "Preview".

## 4. Uncertain or not finished

**Needs you, before uploads work on the preview:**
1. **R2 access keys.** Create an R2 API token with read and write access to `yafa-portal-preview-files`. Then set three secrets on the preview Worker: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`. Until then, uploads answer "file storage is not set up yet".
2. **The bucket's CORS rules** (9.3: uploads only from the portal's origin). They are in `r2/cors-preview.json`. Applying them to the preview bucket is a remote change; I'll run `npx wrangler r2 bucket cors set yafa-portal-preview-files --file r2/cors-preview.json` on your go-ahead.

**Choices of mine, to confirm or change:**
- **Two file uses added:** "branding images" (logo and icon) and "fonts", beyond the brief's five uses, so the Branding screen's files have their own type and size rules.
- **Units of measure:** file settings in megabytes, minutes, pixels and days.
- **Two fixed technical limits:** upload links last 15 minutes (the brief says only "short-lived"), and uploads over 10 MB go in 10 MB parts.
- **"Normal reading contrast":** taken as WCAG AA for normal text, 4.5:1.
- **The on-screen letterhead preview** marks where the logo goes instead of showing it. The PDF preview shows the real logo.
- **The install file** uses the organisation's English name.
- **An existing lint exception:** `sanitize-file-name.ts` (Phase 0) disables one lint rule on purpose, to match control characters. CLAUDE.md forbids disabling lint rules, so it's for you to keep or have rewritten.

**Arabic texts:** every Arabic text on the new screens is a draft for your review (`docs/arabic-texts-review.md`).

## 5. Questions for the owner, and what Phase 3 needs

**Questions:** none open. The two setup steps and the choices above are for your review.

**Phase 3 (Documents archive, Resources library) needs these three proposals confirmed before it starts (brief 31):**
- **P2:** because the archive shows every branch's documents to the General Council, it can read branches' filed statements, meeting reports and closed events there, even where it can't see the live records.
- **P19:** letter templates are structured records (title, subject, body text with named fields, field list, language), edited with a live preview, rather than uploaded files.
- **P20:** an equipment loan records the borrower's name as free text, plus the return date.
