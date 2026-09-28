import { spawnSync } from 'node:child_process';
import { confirmProduction } from '../production/confirm-production.ts';

// D-165 (O-101) and D-220: an environment's phone push keys, made here and
// passed straight into `wrangler secret put` through its input — never
// printed, never written to a file. Existing keys are never replaced, since
// every phone subscribed with them would stop receiving alerts. Production
// only when the owner runs it and types the Worker's name; Claude Code never
// touches production (CLAUDE.md).
const WORKERS = { preview: 'yafa-portal-preview', production: 'yafa-portal-production' } as const;
const NAMES = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'] as const;

const ENV = process.argv[2] ?? '';
const contact = process.argv[3] ?? '';
if (!Object.hasOwn(WORKERS, ENV) || !/^[^@\s]+@[^@\s]+$/.test(contact)) {
  console.error('Usage: npm run push:create-<preview|production>-keys -- <contact email address>');
  process.exit(1);
}
const worker = WORKERS[ENV as keyof typeof WORKERS];

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
  console.error(`Refused: the ${ENV} already has ${existing.join(', ')}. Nothing was changed.`);
  process.exit(1);
}
if (ENV === 'production' && !(await confirmProduction(worker, 'set the phone push keys'))) {
  console.error('Nothing was changed: the name typed did not match.');
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
