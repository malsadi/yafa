# Owner's launch checklist

Everything outstanding on the owner's side at the end of the build, in the order to do it. Written 2026-09-28. Tick each item off as it's done. Where a step says "tell Claude Code", that is the one thing it needs before the next step. Claude Code never runs anything against production (CLAUDE.md).

## A. On the preview: close Phase 12

**1. Set the two new settings.**
- Open the preview and sign in as a system administrator.
- Go to **Administration → Set-up checklist**.
- Set **Rows per page**: how many rows each list shows at a time. Lists wait until it's set.
- Set **Backup retention (days)**: how long nightly backups are kept.
- While you're there, check each **Allowed file types** entry. Any that had WebP chosen now shows as not set; choose again from the types it offers (D-218).

**2. OC-1: generate a real letter and look at its PDF.**
- **Before you start**, on the preview:
  - Correspondence and letters is switched on for your unit;
  - "Reference number format: letters out" is set;
  - there is at least one letter template in the Resources library;
  - you hold "Write letters" and a current role in the unit.
- **Steps:**
  1. Open **Correspondence and letters → Letters out → Write a letter**.
  2. Choose a **Template**, fill in **Recipient's name**, the address if you like, and the **Subject, for the register**. Choose **Sign as**.
  3. Optionally, press **Preview PDF** first.
  4. Press **Generate the letter**. This is for good: it takes the next reference number, is filed, and can never be changed or deleted.
  5. In **Letters out**, open the letter and press **Download**.
- **What to look at:**
  - the letterhead (logo, colours, address);
  - the reference number and date;
  - the recipient and subject;
  - the body and the signature;
  - Arabic joined and right-to-left, in the Arabic font;
  - the margins and page breaks;
  - whether it opens on your phone as well as a computer.

**3. OC-2: upload a photo and open it again.**
- **Before you start**, on the preview:
  - Achievements and reports is switched on for your unit;
  - there is at least one achievement category;
  - "Allowed file types: media images" includes JPEG, and "Size limit (MB): media images" is set;
  - "Maximum image dimension (pixels)" is set;
  - you hold "Record achievements".
- **Steps:**
  1. Open **Achievements and reports → Timeline → Record an achievement**, fill it in, and press **Save**.
  2. On the new achievement, pick a photo in the **Add a photo** field (on a phone you can take one with the camera), then press the **Add a photo** button.
  3. When **Adding…** ends, the photo's name appears under **Photos**. Press **View**: it should download and open the right way up.

**4. Tell Claude Code how 2 and 3 went.** Say what you did and what you saw, and quote any message the portal showed word for word. If something failed, give the time. Once both are done, OC-1 and OC-2 are closed.

**5. Approve Phase 12.** Say that the choices in section 4 of `docs/phase-reports/phase-12.md` are confirmed (or which to change), and that Phase 12 is approved.

## B. The real data

**6. Put the real files in `seed/`.** Git ignores this folder, so the files are never committed.
- **First officers** (loaded by script, `docs/seed-files.md` sections 1 to 4):
  - `units.csv` (the General Council);
  - `roles.csv` (the standard roles);
  - `people.csv` (the first officers, with at least two system administrators, each holding a current term);
  - `privacy-notice-en.txt` and `privacy-notice-ar.txt`.
- **Everyone else** (Data import, `docs/seed-files.md` section 5): the branches, current and past officers, and branch accounts. Keep these import files in a folder of their own, for example `seed/import/`.

**7. Tell Claude Code the files are there.** It checks them with a local dry run only (O-171) and tells you anything to fix.

## C. Production

**8. The domain.**
- The domain must be on your Cloudflare account, so the Worker can serve it.
- Tell Claude Code the domain. It adds it to the `production` block of `wrangler.jsonc`, and writes `r2/cors-production.json` so uploads from that address are allowed.

**9. Create the production resources**, all in the EU, from the repository folder:
```
npx wrangler d1 create yafa-portal-production-db --jurisdiction eu
npx wrangler r2 bucket create yafa-portal-production-files --jurisdiction eu
npx wrangler r2 bucket create yafa-portal-production-backups --jurisdiction eu
npx wrangler queues create yafa-portal-production-notifications
npx wrangler queues create yafa-portal-production-pdf-jobs
```
Tell Claude Code the database id the first command prints. It puts the id in `wrangler.jsonc` in place of `SET-IN-PHASE-12-EU-JURISDICTION-ONLY`. Then set the upload rules:
```
npx wrangler r2 bucket cors set yafa-portal-production-files --file r2/cors-production.json --jurisdiction eu
```

**10. The Clerk production instance** (Clerk dashboard):
1. Create the production instance for your domain, and add the DNS records Clerk lists.
2. Set the same rules as the development instance: sign-up **Restricted**, social sign-in **off**, multi-factor authentication **on**.
3. Add a webhook endpoint `https://<your domain>/api/webhooks/clerk` for the `user.*` events, and copy its signing secret.
4. Copy the production publishable key and secret key.

**11. Set production's secrets.** Run each command and paste the value when asked. Never put one in a file or the repository.
```
npx wrangler secret put CLERK_PUBLISHABLE_KEY --env production
npx wrangler secret put CLERK_SECRET_KEY --env production
npx wrangler secret put CLERK_WEBHOOK_SIGNING_SECRET --env production
npx wrangler secret put R2_ACCOUNT_ID --env production
npx wrangler secret put R2_ACCESS_KEY_ID --env production
npx wrangler secret put R2_SECRET_ACCESS_KEY --env production
```
- **The R2 values:** first create an R2 API token in the Cloudflare dashboard (R2 → Manage API tokens), with Object Read & Write on `yafa-portal-production-files` only. `R2_ACCOUNT_ID` is your Cloudflare account id.
- **Then the phone push keys**, made and set for you without being shown:
  ```
  npm run push:create-production-keys -- <contact email address>
  ```
  It asks you to type `yafa-portal-production` before it sets anything (D-220).

**12. Migrations and the first deploy:**
```
npx wrangler d1 migrations apply yafa-portal-production-db --remote --env production
npx wrangler deploy --env production
```

**13. Load the first officers:**
```
npm run seed:load -- --target production --language <en|ar>
npm run seed:load -- --target production --language <en|ar> --apply
```
- The first command only checks. The second asks you to type `yafa-portal-production-db`, then loads.
- Then run `npm run seed:invitations` and invite exactly those people from the **production** Clerk dashboard.

**14. Set the portal up.**
- Sign in as a system administrator, and read and accept the privacy notice.
- Work through **Administration → Set-up checklist** until nothing is left: every setting (including Rows per page and Backup retention), the lists, the role designations, the permissions matrix, branding, the texts, and the file types (passive only).
- Switch services on for each unit.

**15. Import everyone else.**
- Go to **Administration → Operations → Data import**.
- Run the dry run with your import files and fix anything it lists. Then import. It is safe to run again.
- Each branch's treasurer then enters their account's opening balance once, in the Treasury ("Enter the opening balance").

**16. Before inviting everyone:**
- Ask Claude Code to repeat the Chrome sandbox check (D-197) on the commit that is live.
- Then invite the rest of the officers from the production Clerk dashboard.
