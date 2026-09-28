import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { E2E_WORLD, q } from './e2e-world.ts';

/**
 * D-213 choice, Phase 10: what the "send and receive a letter with a linked
 * reply" journey needs (brief 27) — the letterhead's files, a letter
 * template, and a letter already received for each language's run. A
 * received letter's scan goes straight to R2 by a signed link, which the
 * local test server cannot give, so its recording is tested in the API
 * tests and the journey starts from the letter received. Fictional values.
 */
export const E2E_LETTERS = {
  template: { id: 'e2e-letter-template', title: 'Fictional thanks (test)' },
  lettersIn: {
    en: { id: 'e2e-letter-in-en', sender: 'Fictional Hall Trust (test)', number: 1 },
    ar: { id: 'e2e-letter-in-ar', sender: 'صندوق القاعة التجريبي', number: 2 },
  },
  files: {
    logo: { id: 'e2e-logo-file', name: 'logo.png', type: 'image/png', use: 'branding-images' },
    latin: { id: 'e2e-latin-font', name: 'latin.woff2', type: 'font/woff2', use: 'fonts' },
    arabic: { id: 'e2e-arabic-font', name: 'arabic.woff2', type: 'font/woff2', use: 'fonts' },
    scan: {
      id: 'e2e-letter-scan',
      name: 'letter.pdf',
      type: 'application/pdf',
      use: 'letter-scans',
    },
  },
} as const;

// A 1×1 PNG, the smallest real logo; the fonts are placeholders the PDF skips.
const LOGO_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const keyOf = (file: { id: string; name: string }) =>
  `${E2E_WORLD.branch.code}/e2e/${file.id}-${file.name}`;

/** The letterhead's files and the scan, recorded as the portal records them. */
function filesSql(now: string): string[] {
  const branch = `(SELECT id FROM units WHERE code = ${q(E2E_WORLD.branch.code)})`;
  return Object.values(E2E_LETTERS.files).map(
    (f) =>
      `INSERT INTO files (id, key, unit_id, service, record_id, use, file_name, uploaded_by, size, content_type, checksum, locked, created_at)
       VALUES (${q(f.id)}, ${q(keyOf(f))}, ${branch}, 'e2e', 'e2e', ${q(f.use)}, ${q(f.name)}, 'e2e', 1, ${q(f.type)}, 'e2e', 1, ${q(now)});`,
  );
}

/** A branch letter template, and each run's letter received — numbered, filed, and handled by the approver. */
export function lettersSql(now: string): string[] {
  const branch = `(SELECT id FROM units WHERE code = ${q(E2E_WORLD.branch.code)})`;
  const person = (who: string) => `(SELECT id FROM people WHERE email LIKE 'e2e.${who}%')`;
  const year = Number(now.slice(0, 4));
  const { template, lettersIn, files } = E2E_LETTERS;
  return [
    ...filesSql(now),
    `INSERT INTO library_letter_templates (id, unit_id, title, subject, body, fields, language, retired_at, version, created_by, created_at, updated_by, updated_at)
     VALUES (${q(template.id)}, ${branch}, ${q(template.title)}, 'Thank you, {{venue}}', 'Dear {{contact}},\n\nThank you for your letter about {{venue}}.', '["venue","contact"]', 'en', NULL, 1, 'e2e', ${q(now)}, 'e2e', ${q(now)});`,
    `INSERT INTO letter_counters (unit_id, direction, year, last_number) VALUES (${branch}, 'in', ${String(year)}, 0);`,
    ...Object.values(lettersIn).flatMap((l) => {
      const reference = `${E2E_WORLD.branch.code}/IN/${String(year)}/00${String(l.number)}`;
      return [
        `UPDATE letter_counters SET last_number = last_number + 1 WHERE unit_id = ${branch} AND direction = 'in' AND year = ${String(year)};`,
        `INSERT INTO letters_in (id, unit_id, reference_number, sequence_year, sequence_number, date_received, sender, subject, handler_person_id, status, answers_letter_out_id, file_id, version, created_by, created_at, updated_by, updated_at)
         VALUES (${q(l.id)}, ${branch}, ${q(reference)}, ${String(year)}, ${String(l.number)}, ${q(now.slice(0, 10))}, ${q(l.sender)}, 'Fictional request (test)', ${person('approver')}, 'Received', NULL, ${q(files.scan.id)}, 1, 'e2e', ${q(now)}, 'e2e', ${q(now)});`,
        `INSERT INTO library_letters_in (id, unit_id, reference_number, letter_id, file_id, filed_at)
         VALUES (${q(`${l.id}-filed`)}, ${branch}, ${q(reference)}, ${q(l.id)}, ${q(files.scan.id)}, ${q(now)});`,
      ];
    }),
  ];
}

/** The files themselves, in the test server's own local storage. */
export function putLetterFiles(stateDir: string, bucket: string): void {
  for (const file of Object.values(E2E_LETTERS.files)) {
    const local = path.join(stateDir, file.name);
    writeFileSync(
      local,
      file.id === E2E_LETTERS.files.logo.id ? Buffer.from(LOGO_PNG, 'base64') : 'fictional (test)',
    );
    execFileSync(
      'npx',
      [
        'wrangler',
        'r2',
        'object',
        'put',
        `${bucket}/${keyOf(file)}`,
        '--file',
        local,
        '--content-type',
        file.type,
        '--local',
        '--env',
        'e2e',
        '--persist-to',
        stateDir,
      ],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
  }
}
