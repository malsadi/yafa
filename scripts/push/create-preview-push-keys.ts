import { spawnSync } from 'node:child_process';

// D-165 (O-101): the preview's phone push keys, made here and passed
// straight into `wrangler secret put` through its input — never printed,
// never written to a file. Preview only: production is never touched by
// Claude Code (CLAUDE.md). Existing keys are never replaced, since every
// phone subscribed with them would stop receiving alerts.
const ENV = 'preview';
const NAMES = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'] as const;

const contact = process.argv[2] ?? '';
if (!/^[^@\s]+@[^@\s]+$/.test(contact)) {
  console.error('Usage: npm run push:create-preview-keys -- <contact email address>');
  process.exit(1);
}

function wrangler(args: string[], input?: string): string {
  const result = spawnSync('npx', ['wrangler', ...args, '--env', ENV], {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  if (result.status !== 0) throw new Error(`wrangler ${args.join(' ')} failed`);
  return result.stdout;
}

const existing = (
  JSON.parse(wrangler(['secret', 'list', '--format', 'json'])) as { name: string }[]
)
  .map((s) => s.name)
  .filter((name) => (NAMES as readonly string[]).includes(name));
if (existing.length > 0) {
  console.error(`Refused: the preview already has ${existing.join(', ')}. Nothing was changed.`);
  process.exit(1);
}

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
]);
const publicKey = Buffer.from(await crypto.subtle.exportKey('raw', pair.publicKey)).toString(
  'base64url',
);
const privateKey = (await crypto.subtle.exportKey('jwk', pair.privateKey)).d ?? '';
const values: Record<(typeof NAMES)[number], string> = {
  VAPID_PUBLIC_KEY: publicKey,
  VAPID_PRIVATE_KEY: privateKey,
  VAPID_SUBJECT: `mailto:${contact}`,
};
for (const name of NAMES) {
  wrangler(['secret', 'put', name], values[name]);
  console.log(`set: ${name} (${ENV})`);
}
