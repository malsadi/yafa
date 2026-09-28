# Resume notes

Written 2026-09-28, at the end of Phase 12. The earlier notes are in git history.

## Where things stand

- **Current phase:** Phase 12, Operations and launch. It is built and awaiting approval (`docs/phase-reports/phase-12.md`). Phases 0 to 11 are approved (D-216).
- **Records:**
  - Phase 12's answers are D-217;
  - its technical records are T-157 to T-160;
  - the security review is `docs/security-review.md`.
- **Migrations:** 0055 to 0057 are Phase 12's. CI applies them to the preview on push.
- **Preview:** after the push, set "Rows per page" and "Backup retention (days)". Lists and backups wait for them.

## Waiting for the owner

- The approval of Phase 12, and the choices in section 4 of its report.
- The domain and the Clerk production instance. After that, the production steps in `docs/operations.md` are the owner's to run.
- The real branches and officers files in `seed/` (never committed). Check them with a local dry run only.
- On the preview:
  - check that the CI deploy with the rate-limit bindings succeeded;
  - upload a photo;
  - generate a real letter PDF.

## Never

- Run anything against production, or deploy it.
- Read `.dev.vars`, or commit `seed/`.
- Run a remote D1 query on the preview. The permission system refused it twice, so don't try again.
