import { defineConfig } from 'drizzle-kit';

// `generate` only diffs the schema against migrations/meta's snapshots — it
// never opens a connection, so dbCredentials.url is a placeholder the type
// requires but generate never reads. Applying migrations for real goes
// through `wrangler d1 migrations apply` (npm run db:migrate:local), not
// drizzle-kit push.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema/**/*.ts',
  out: './migrations',
  dbCredentials: { url: 'file:./.drizzle-placeholder.sqlite' },
});
