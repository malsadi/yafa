# Phase 10 report: Correspondence and letters

**Status:** built straight through under D-213, with no approval stop before Phase 11. It is for your review together with the Phase 11 report. The choices I made for you are in section 4, each marked "(D-213 choice)".

**Brief section 26, Phase 10:** "PDF letters on letterhead, references, registers, linked replies, Library D2 and D3 populated." This is service 7, brief 23. It also covers:
- 10.1: two rows, "Letter generated" and "Letter received";
- 10.2: no interaction with the Communication hub;
- 9.4: the letter on letterhead;
- 27: the journey "send and receive a letter with a linked reply".

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** none for Phase 10 in brief 31. P19 (letter templates as structured records) was confirmed in D-095 and built in Phase 4.
- **Owner inputs:** none in brief 30 beyond the data administrator's own: the two reference number formats, and the "letter scans" file settings.
- **Already built for this phase:**
  - letter templates and their previews (Phase 4);
  - the library's Letters out and Letters in lists, and `fileLetter()` (Phase 3);
  - the letterhead and its signature block (Phase 2).
- **Questions before building:** O-135 to O-147, answered 2026-09-28 (D-214). All as recommended, except O-137: a format without `{year}` is refused as well.

## 1. What was built, by sub-point

Every sub-point has its Worker routes, permission sweep entries, screens in English and Arabic, and tests. Migration 0053 belongs to Phase 10.

**Stage A: Writing letters**
- **A1 Letter templates:** the writer chooses from the unit's own templates and the General Council's, never a retired one (O-141). The national ones are marked "(General Council)".
- **A2 Generate PDF letters:**
  - **What the writer fills in:** the recipient's name and optional address, every field the template names, and a subject for the register (O-139). The subject starts as the template's own, filled in as the fields are typed.
  - **Checking before generating:** a live preview on the unit's letterhead, and "Preview PDF" (one rendering call per press).
  - **Generating:** the letter is made on the generating unit's own letterhead, in the template's language (9.4). It shows the reference and date, the recipient, the text, and the signer's name, role and unit.
  - **Who signs:** always the writer. With more than one current role in the unit, they choose which role signs (O-140).
  - **Once generated:** the letter is numbered, filed and locked (O-142).

**Stage B: References and registers**
- **B1 Reference numbers:**
  - Built from the administrator's two formats, using `{unit_code}`, `{year}` and `{number:N}`.
  - Each unit has two sequences, out and in, which restart each year (O-137).
  - The number is taken in SQL in the register entry's own batch, and a trigger checks it (T-154). The concurrency test proves no two letters share a number and there are no gaps.
  - The settings screen refuses a format without `{number}` or `{year}` as it is typed, and the Worker refuses one too.
- **B2 Letters out register:** reference, date, recipient, subject and sent by, the latest first. The PDF is filed under Letters out (D2) in the same batch.
- **B3 Letters in register:**
  - **The register:** reference, date received, sender, subject, handling officer and status.
  - **Recording a letter:** the date received can't be in the future (O-143). The scan or photo is uploaded under the "letter scans" rules, then numbered and filed under Letters in (D3) in one batch.
- **B4 Linked replies:**
  - **Status moves:** Received → Awaiting reply or No reply needed, and No reply needed back to Awaiting reply (O-144). Generating a reply marks the letter Replied, in the reply's own batch. Replied is final; follow-up letters can still link to it.
  - **The handling officer:** can move the status without a capability (O-135). Those who record letters in can change the handling officer while the letter is open (O-145).
  - **Following an exchange:** a letter in can be linked to our letter out it answers (O-146). Each letter's page shows the whole exchange, following links in both directions.

**Rules**
- **Storage:** letters are stored only in the library. This service writes the register and files each letter there.
- **Who sees letters:** each unit sees only its own letters in and out, the General Council included (7.3).
- **Service switch:** Correspondence needs the Resources library switched on, and the library can't be switched off while Correspondence is on (O-147).
- **Inactive branches:** their letters are read-only (P4).
- **No Communication hub:** a structure test holds this service away from it (10.2).

## 2. Test and lint results

These are for Phase 10 as committed. The final figures for both phases are in the Phase 11 report.

- **Type check, lint, formatting, build:** pass.
- **Tests:** 824 pass, none skipped (793 at the end of Phase 9).
- **Permission sweep:** passes, with all 14 Correspondence routes in it.
- **Browser journey "send and receive a letter with a linked reply":** passes in English and Arabic.

**New checks:**
- **Numbering:** three letters generated at the same moment get 002, 003 and 004. Last year's count doesn't carry over into this year.
- **Reference formats:** every refusal in the shared rule is tested, and so is the settings screen's check.
- **Immutability (database triggers):**
  - a letter out is never changed or deleted;
  - a letter in is never deleted, and only its status and handling officer change, by version;
  - a counter only moves on by one and is never removed;
  - Replied needs a reply;
  - a letter needing no reply can't be answered.
- **Permissions:** writing, recording, reading, and the handling officer's own path are each tested. Another unit's letters are never found. The General Council can't read a branch's letters.
- **10.2:** Correspondence reaches only the Committee register, the Resources library and the Administration panel, never the Communication hub.

**Dependencies:** none added.

## 3. Owner answers received and recorded

- **D-213:** Phases 10 and 11 built back to back, with choices recorded for review at the end.
- **D-214:** O-135 to O-147, all as recommended, with O-137 tightened so a format without `{year}` is refused.

## 4. Choices I made for you (D-213), and what is not finished

**Choices, to confirm or change:**
1. **A letter waits for a complete letterhead:** the organisation's name, both colours, the logo and its position, and the font for the template's language. A real letter never prints the logo's empty placeholder the previews show. Until those are set, generating says the letterhead isn't set up.
2. **The handling officer can see the letter,** as well as move its status, without "Read the letter registers". Otherwise they couldn't act on it. They still don't see the registers.
3. **Awaiting reply can move to No reply needed,** not only Received. The branch may decide later that no reply is needed.
4. **The year in a reference** is the London year on the day the letter is generated or recorded, not the date it was received.
5. **Writing a letter needs only "Write letters",** not the library's read capability, to use the templates.
6. **The letter out a letter in answers** is chosen when the letter in is recorded, and doesn't change later. Like the rest of the letter's details, it is fixed.
7. **Screen details:**
   - "Sign as" is chosen for the writer when they hold only one role in the unit.
   - Opening "Write a reply" from a letter in fills in "In reply to".
   - The register subject follows the template's subject until the writer types their own.
8. **The letter's layout:**
   - The reference and date sit at the end of the line, as "Our reference: …" and "Date: …", with the recipient's name and address lines below.
   - The date is written in the template's language, with Western digits, as the meeting report's is.
   - The PDF is saved under its reference, with symbols made hyphens.
9. **Registers are listed newest first:** letters out by date, letters in by date received. There are no filters, since the brief names none.
10. **A number already taken** (another letter generated at the same moment) is retried with the next number up to three times, then the writer is asked to try again (T-154).
11. **The browser journey starts from a letter already received,** placed in the test world. A letter in's scan goes straight to R2 by a signed link, which the local test server can't provide. Recording a letter in is tested in the API tests with the upload simulated.

**Not checked here:**
- **Recording a letter in through the browser:** the real upload to R2 can be checked on the preview, now that the R2 keys are set.
- **A generated letter's look:** nobody has looked at one yet. The browser journey makes one locally with a placeholder logo.

## 5. Questions for the owner

None new. Phase 11 followed straight on (D-213); its report has its own section 5.
