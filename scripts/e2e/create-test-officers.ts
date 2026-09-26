import { TEST_OFFICERS } from './test-officers.ts';

// D-135: run by the owner (`npm run e2e:create-test-officers`), which loads
// the development instance's secret key from .dev.vars into the process —
// Claude Code never reads that file. Nothing here prints the key.
const API = 'https://api.clerk.com/v1';
const key = process.env.CLERK_SECRET_KEY ?? '';
if (!key.startsWith('sk_test_')) {
  console.error('Refused: this only runs against a Clerk development instance (a sk_test_ key).');
  process.exit(1);
}
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

async function existing(email: string): Promise<string | null> {
  const res = await fetch(`${API}/users?email_address=${encodeURIComponent(email)}`, { headers });
  if (!res.ok) throw new Error(`Clerk answered ${String(res.status)} when looking for ${email}`);
  const users = (await res.json()) as { id: string }[];
  return users[0]?.id ?? null;
}

for (const officer of TEST_OFFICERS) {
  const found = await existing(officer.email);
  if (found) {
    console.log(`already there: ${officer.email} (${found})`);
    continue;
  }
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email_address: [officer.email],
      first_name: officer.firstName,
      last_name: officer.lastName,
    }),
  });
  if (!res.ok)
    throw new Error(
      `Clerk answered ${String(res.status)} when creating ${officer.email}: ${await res.text()}`,
    );
  const created = (await res.json()) as { id: string };
  console.log(`created: ${officer.email} (${created.id})`);
}
