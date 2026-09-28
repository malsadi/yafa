import { env } from 'cloudflare:workers';
import type { LetterheadInput } from '../../../src/pdf-templates/letterhead/letterhead-input';
import { setSetting } from '../../../src/worker/core/settings';
import { call, switchService } from '../meeting-recorder/meeting-fixtures';
import type { Officer } from '../treasury/treasury-fixtures';

export { call, switchService };
export {
  colleagueOf,
  treasuryOfficer as letterOfficer,
  type Officer,
} from '../treasury/treasury-fixtures';

export const READ = 'correspondence-and-letters.registers.read';
export const WRITE = 'correspondence-and-letters.letters-out.write';
export const RECORD = 'correspondence-and-letters.letters-in.record';
export const unitLetters = (unitId: string) => `/api/correspondence-and-letters/units/${unitId}`;
export const today = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
export const thisYear = () => Number(today().slice(0, 4));

/** The administrator's reference formats (D-214), and what a letter needs of the branding. */
export async function setLetterSettings(actorPersonId: string): Promise<void> {
  for (const [key, value] of [
    ['correspondence-and-letters.reference_format_out', '{unit_code}/OUT/{year}/{number:3}'],
    ['correspondence-and-letters.reference_format_in', '{unit_code}/IN/{year}/{number:3}'],
    ['administration-panel.organisation_name', { en: 'Example Council', ar: 'مجلس تجريبي' }],
    ['administration-panel.main_colour', '#1D4ED8'],
    ['administration-panel.accent_colour', '#B91C1C'],
    ['administration-panel.logo_position', 'left'],
    ['administration-panel.logo_file', 'fictional-logo-file'],
    ['administration-panel.latin_font_file', 'fictional-latin-font'],
    ['administration-panel.arabic_font_file', 'fictional-arabic-font'],
    ['administration-panel.file_types_letter_scans', ['application/pdf', 'image/jpeg']],
    ['administration-panel.file_size_limit_letter_scans_mb', 5],
    ['administration-panel.download_link_threshold_mb', 1],
    ['administration-panel.download_link_lifetime_minutes', 5],
  ] as const) {
    await setSetting(env.DB, { key, value, actorPersonId });
  }
}

/** The library and Correspondence on for the unit (O-147: letters need the library). */
export async function switchLettersOn(unitId: string): Promise<void> {
  await switchService('resources-library', unitId, true);
  await switchService('correspondence-and-letters', unitId, true);
}

/** A fictional letter template of the unit's (16 D1, P19). */
export async function addTemplate(
  officer: Officer,
  p: { id: string; subject?: string | null; language?: 'en' | 'ar'; retired?: boolean },
): Promise<void> {
  const at = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO library_letter_templates (id, unit_id, title, subject, body, fields, language,
       retired_at, version, created_by, created_at, updated_by, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
  )
    .bind(
      p.id,
      officer.unitId,
      `Fictional template ${p.id}`,
      p.subject === undefined ? 'Thank you, {{venue}}' : p.subject,
      'Dear {{contact}},\n\nThank you for hosting us at {{venue}}.',
      JSON.stringify(['venue', 'contact']),
      p.language ?? 'en',
      p.retired ? at : null,
      officer.personId,
      at,
      officer.personId,
      at,
    )
    .run();
}

/** What the writer sends to generate a letter (23 A2; D-214). */
export const letterBody = (p: {
  templateId: string;
  signerRoleId: string;
  replyTo?: string | null;
}) => ({
  templateId: p.templateId,
  recipientName: 'Fictional Hall Manager',
  recipientAddress: '1 Fictional Street\nExampletown',
  subject: 'Thanks for the hall',
  fieldValues: { venue: 'Fictional Hall', contact: 'Ms Example' },
  signerRoleId: p.signerRoleId,
  replyToLetterInId: p.replyTo ?? null,
});

/** The role a fixture officer holds in their unit (treasury-fixtures' naming). */
export const roleOf = (officer: Officer) =>
  `01ARZ3NDEKTSV4RRFFQ69AR${officer.clerkUserId.slice(-3)}`;

/** Letters "rendered" in tests: the written letter kept, and fictional PDF bytes returned. */
export function fakeRenderer() {
  const rendered: Omit<LetterheadInput, 'logoSrc'>[] = [];
  const render = (letter: Omit<LetterheadInput, 'logoSrc'>) => {
    rendered.push(letter);
    return Promise.resolve(new TextEncoder().encode('%PDF fictional letter'));
  };
  return { rendered, render };
}

/** Start, put the scan where the browser would, then record the letter in (9.3; 23 B3). */
export async function recordLetterIn(
  officer: Officer,
  details: {
    handlerPersonId: string;
    answersLetterOutId?: string | null;
    dateReceived?: string;
    sender?: string;
  },
) {
  const unit = unitLetters(officer.unitId);
  const startRes = await call(officer.clerkUserId, 'POST', `${unit}/letters-in/uploads`, {
    fileName: 'letter.pdf',
    size: 3,
    contentType: 'application/pdf',
  });
  if (!startRes.ok) return startRes;
  const start = await startRes.json<{ letterId: string; fileId: string }>();
  await env.FILES.put(
    `app-branch-${officer.clerkUserId.slice(-3)}/correspondence-and-letters/${start.letterId}/${start.fileId}-letter.pdf`,
    'pdf',
    { httpMetadata: { contentType: 'application/pdf' } },
  );
  return call(officer.clerkUserId, 'PUT', `${unit}/letters-in/${start.letterId}`, {
    fileId: start.fileId,
    fileName: 'letter.pdf',
    dateReceived: details.dateReceived ?? today(),
    sender: details.sender ?? 'Fictional Sender',
    subject: 'A fictional request',
    handlerPersonId: details.handlerPersonId,
    answersLetterOutId: details.answersLetterOutId ?? null,
  });
}
