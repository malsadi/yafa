# Phase 4 report: Treasury

**Status:** approved 2026-09-26 (D-136). The five choices were confirmed (D-134); O-077 was answered (D-135).

- **Started:** 2026-09-26, when Phase 3 was approved (D-115).
- **Scope** (brief section 26, Phase 4): "Branch accounts, all entry rules, approvals, corrections, statements, year-end close. Event account functions internal only. Full integrity suite." Service 3, brief 17.

**Before starting:**
- **P-items:** P6 to P10, confirmed 2026-09-26 (D-116).
- **Owner inputs:** none for Phase 4 in brief 30. Opening balances come with the Phase 12 import.
- **Questions:** O-060 to O-076 were asked and answered (D-117 to D-133).

## 1. What was built, by sub-point

| # | Built | Where recorded |
|---|---|---|
| A1 Branch accounts | Opened with a name, bank or cash, and an opening balance entry (zero or negative too) with its date (P6, D-117, D-119). Closed only at zero with nothing awaiting approval; kept with its history, never reopened (D-118). | T-134, T-135 |
| A2 Event accounts | `openEventAccount` (with budget lines, each a name and an amount) and `closeEventAccount`, internal to the Event organiser. The Treasury's API refuses to close an event account. At close, the balance returns to the branch account, or an overspend is brought to zero from it, worked out in SQL in the batch; no approval needed (P8, D-131). | T-137 |
| B1 Credits, B2 Debits | Amount, date, account, source or paid to, and description. Dated up to today, never in a closed year (D-121). Entries in an event account can be tagged to a budget line (P10). | T-135 |
| B3 Transfers | One record that debits one account and credits another, between the unit's own open accounts (D-122). | T-135 |
| B4 Receipt photos | Taken with the camera or chosen, and resized on the device. Attached when saving or added later; never removed. Required when the setting says so; otherwise "No receipt" informs (D-123). | T-133, T-135 |
| B5 Payment approval | A debit or transfer above the threshold is saved as Awaiting approval and counts only once Approved. Declined, it stays in the history with who and why. Never approved by the officer who entered it, in the service and in the database (7.3, P7, D-124). Approvers work from a list; no notification is sent (D-133). | T-135 |
| B6 Corrections | "Correct" records a reversing entry, dated today and linked to the original, needing no approval. Each entry is reversed once; a reversal is never reversed (D-126). | T-134, T-135 |
| C1 Balances | Live per account, derived from counted entries, with the total of the unit's open accounts (D-127). Below zero is allowed, with a clear warning (D-120). | T-134 |
| C2 Statements | Any account, any period: viewed, downloaded as a PDF in the officer's language, or filed to the archive's Finance category (P9, D-128). | T-136 |
| C3 Year-end close | A year closes once it has ended, after the year before it, and with nothing awaiting approval. Closing locks its entries and files a statement for every account (P9, D-128). | T-136 |
| Build notes | `yearEndSummary(unitId, year)` for the annual report (D-130). The integrity suite covers every point the brief lists. | T-137 |

**Brief 17's rules, all held:**
- Accounts are split into branch and event accounts.
- Event accounts are opened and closed through the Event organiser only.
- Second-officer approval, never self-approval.
- Entries are never deleted; corrections are reversing entries.
- Each financial year is closed and locked by the treasurer.
- Balances are always derived; there is no cached balance.
- A transfer is one atomic record.

**Screens:**
- **Accounts:** balances and the unit total; opening and closing accounts.
- **An account's page:**
  - recording credits, debits and transfers, with a warning before saving if money going out takes the account below zero;
  - its entries, with status badges, who entered and decided each, receipts, and "Correct";
  - its statement.
- **Awaiting approval:** approve, or decline with a reason.
- **Financial years:** each year's state, and closing it.
- **Texts:** every text is in English and Arabic. The Arabic ones are drafts for your review.

## 2. Test and lint results

At the Phase 4 commit, judged by exit code:
- **Type check:** passes.
- **Lint:** passes, including the file-size and import-boundary rules. No rule is disabled.
- **Formatting:** passes.
- **Tests:** 628 pass, none skipped (587 at the end of Phase 3).
- **Permission sweep:** passes, with every Treasury route in it.
- **Build:** passes.

**Integrity and immutability tests:**
- Every balance equals the sum of its counted entries, even with 24 entries saved at once.
- No Treasury path deletes anything.
- Every column of an entry refuses change, save its one approval decision.
- Self-approval fails, in the service and in the database.
- Closed-year entries can't be added or changed, and a closed year can't reopen.
- The event close leaves the event account at zero and the branch account changed by exactly that amount.
- An account never closes away from zero.
- Receipts can't be changed or removed.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-116:** P6 to P10 confirmed.
- **D-117 to D-133 (O-060 to O-076):** all as recommended, with these calls:
  - An opening balance can be negative.
  - Going below zero is allowed, with a clear warning.
  - An ordinary transfer above the threshold needs approval.
  - A reversing entry needs no approval.
  - An overspent event is brought to zero from the branch account, with a warning at close.
  - No notifications here; they come in Phase 7.

## 4. Uncertain or not finished

**To check on the preview:**
- A statement PDF (Browser Rendering).
- A year-end close, which renders one PDF per account.
- Receipt photos, once the R2 keys are set.

**Choices of mine, to confirm or change:**
- **"Above the threshold"** means strictly more than it; an amount equal to it needs no approval.
- **Receipts** can't be added to an entry in a closed year, since its entries are locked.
- **Transfers** take no receipts, since B4 names credits and debits.
- **Statement PDFs** wait until the organisation's name is set, since they are headed with it.
- **The year-end close** skips an account whose statement for exactly that year was already filed by hand.

## 5. Questions for the owner, and what Phase 5 needs

**Question:**
- **O-077:** end-to-end journeys signed in (brief 27) need fictional test officers in the Clerk development instance. May I create them, or will you?

**Phase 5 (Task tracker):** brief 31 lists no proposals for it, and brief 30 no owner inputs.
