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

Everything outstanding is the owner's, in order, in `docs/owner-launch-checklist.md`:
- the two settings on the preview;
- OC-1 and OC-2, which stay open until the owner says they're done (remind them at the end of every session);
- Phase 12's approval;
- the real seed files, which get a local dry run only;
- the domain, the production resources, the Clerk production instance, the secrets, the first deploy, the first officers, the set-up and the import.

When the owner gives the domain, add it to `wrangler.jsonc` and write `r2/cors-production.json`. When they give the production database id, put it in `wrangler.jsonc`.

## Never

- Run anything against production, or deploy it.
- Read `.dev.vars`, or commit `seed/`.
- Run a remote D1 query on the preview. The permission system refused it twice, so don't try again.
