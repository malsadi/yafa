# Operations

How the portal is deployed, backed up, restored and kept running (brief 26 Phase 12; D-217). Production is always deployed by the owner, never by Claude Code (CLAUDE.md).

## 1. Deploying

**Preview.** Every push to `main` runs CI, which checks the code, applies new migrations to the preview database (`npm run db:migrate:preview`), and deploys the preview Worker. Nothing else is needed.

**Production.** The owner does each step, in this order:

1. **Domain (O-170).** When you have it, add it to the `production` block of `wrangler.jsonc`:
   ```jsonc
   "routes": [{ "pattern": "<your domain>", "custom_domain": true }],
   ```
   Then add the domain to the files bucket's upload rules: copy `r2/cors-preview.json` to `r2/cors-production.json` with the new origin, and run `npx wrangler r2 bucket cors set yafa-portal-production-files --file r2/cors-production.json --jurisdiction eu`.
2. **Database, EU only.** Run `npx wrangler d1 create yafa-portal-production-db --jurisdiction eu`, and put the id it prints in place of `SET-IN-PHASE-12-EU-JURISDICTION-ONLY`.
3. **Buckets and queues.** Create the two EU buckets (`yafa-portal-production-files` and `yafa-portal-production-backups`, each with `--jurisdiction eu`) and the two queues (`yafa-portal-production-notifications` and `yafa-portal-production-pdf-jobs`).
4. **Clerk production instance.** Create it in Clerk's dashboard, with the same rules as the development instance: sign-up Restricted, social sign-in off, and multi-factor authentication on. Point its webhook at `https://<domain>/api/webhooks/clerk` for the `user.*` events.
   - The security policy reads Clerk's address from the publishable key, so nothing in the code changes.
   - Clerk's usage telemetry is already off (T-153).
5. **Secrets.** Run `npx wrangler secret put <NAME> --env production` for each of these:
   - `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET`;
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT`: don't set these by hand. Run `npm run push:create-production-keys -- <contact email>`, which makes new keys and sets all three, never showing them. It asks you to type `yafa-portal-production` first, and refuses if production already has keys (D-220);
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`, from an R2 API token limited to the production files bucket.

   Never put a secret in the repository.
6. **Migrations and the first deploy.** Run `npx wrangler d1 migrations apply yafa-portal-production-db --remote --env production`, then `npx wrangler deploy --env production`.
7. **The first officers.** See section 5.

## 2. Backups

- **Every night at 02:00 UTC**, the `backup` job writes the whole database as one SQL file to the backup bucket (`backups/<time>.sql`). It writes the tables first, then every row, then the indexes and triggers, and it includes the migrations table (O-161).
- **Retention:** backups older than "Backup retention (days)" are removed. While that setting is unset, none are removed.
- **The Backups screen** (Administration → Operations) lists them and has "Back up now". There is no restore button.
- **D1 Time Travel** keeps 30 days of history as well, and is the fast way back from a mistake.

## 3. Restoring

Restoring replaces data, so the owner decides it and runs it.

**From D1 Time Travel** (the last 30 days, to a moment):

1. Put the portal in maintenance mode (Operations → Maintenance mode).
2. Find the moment: `npx wrangler d1 time-travel info yafa-portal-<env>-db --timestamp <ISO time> --env <env>`.
3. Restore: `npx wrangler d1 time-travel restore yafa-portal-<env>-db --timestamp <ISO time> --env <env>`.
4. Check the portal, then take it out of maintenance mode.

**From a nightly backup** (older than Time Travel reaches, or into a new database):

1. Download the file from the backup bucket: `npx wrangler r2 object get yafa-portal-<env>-backups/backups/<file>.sql --file restore.sql --jurisdiction eu`.
2. Create an empty EU database: `npx wrangler d1 create <new name> --jurisdiction eu`. Don't apply migrations to it: the file makes every table itself.
3. Load it: `npx wrangler d1 execute <new name> --remote --file restore.sql`.
4. Point the `database_id` in `wrangler.jsonc` at the new database and deploy. Later migrations carry on from the migrations table in the file.

Files in R2 are not in the database backup. They are never deleted by the portal except by the orphan clean-up, which removes only objects with no record.

## 4. Rotating secrets

Set the new value with `npx wrangler secret put <NAME> --env <env>`. It takes effect at once, with no redeploy.

- **Clerk keys:** make new keys in Clerk's dashboard, set both, then revoke the old ones.
- **Webhook secret:** roll it in Clerk's webhook settings, then set `CLERK_WEBHOOK_SIGNING_SECRET`.
- **R2 keys:** create a new R2 API token with the same limits, set the three `R2_*` secrets, then delete the old token.
- **Push (VAPID) keys:** new keys make every phone subscribe again, so rotate them only if they leak. Officers then turn phone alerts on again.

## 5. Adding the first officers

The General Council, the standard roles, the first officers (with at least two system administrators) and the first privacy notice come from the owner's seed files. Everyone else comes through Data import.

1. Put the owner's files in `seed/`, which git ignores. The format is in `docs/seed-files.md`, sections 1 to 4.
2. Check them: `npm run seed:load -- --target <preview|production> --language <en|ar>`. This checks the files and that the database is empty, and writes nothing.
3. Load them: the same command with `--apply`. For production it asks you to type `yafa-portal-production-db` first, and loads nothing unless you do (D-220).
4. `npm run seed:invitations` lists who to invite. Invite them from the Clerk dashboard of the same environment (D-075). Each account links to its person by email when they sign up.
5. Sign in as a system administrator, read and accept the privacy notice, and work through **Administration → Set-up checklist** until nothing is left: every required setting, list and designation, the permissions matrix, branding and texts. Then switch services on for each unit.
6. The rest of the organisation (branches, current and past officers, branch accounts) comes through **Administration → Operations → Data import**, in the format of `docs/seed-files.md` section 5. It runs a dry run first and is safe to run again. Each treasurer then enters their account's opening balance in the Treasury (D-217).

## 6. If administrators lose access

- At least two system administrators always exist (P21), so first ask the other one. They can appoint a replacement on the System administrators screen.
- If every administrator has lost access, the owner can appoint one directly in the database. This is the only supported change made outside the portal. First find the person's id with `SELECT id, email FROM people WHERE email = '<their email>'`, then run:
  ```
  npx wrangler d1 execute yafa-portal-<env>-db --remote --env <env> --command "INSERT INTO system_administrators (person_id, created_at) VALUES ('<person id>', '<ISO time>')"
  ```
  Record in `docs/decisions.md` that it was done, and why.
- A Clerk account that is locked or lost is unlocked, or re-invited, from Officer accounts.

## 7. Rate limits

These are set in `wrangler.jsonc`, per minute (O-163):
- uploads: 30 per officer;
- the session and "me" calls: 60 per officer;
- the calendar feed: 60 per link;
- the Clerk webhook: 120.

A request over a limit is refused with "too many requests". Change a limit in `wrangler.jsonc` and deploy.
