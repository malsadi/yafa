import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

interface EnvironmentConfig {
  vars?: { CRON_JOBS?: Record<string, string> };
  d1_databases?: { database_name: string }[];
  r2_buckets?: { bucket_name: string; jurisdiction?: string }[];
  queues?: { producers?: { queue: string }[] };
}
interface WranglerConfig extends EnvironmentConfig {
  triggers: { crons: string[] };
  env: Record<'preview' | 'production', EnvironmentConfig>;
}

// wrangler.jsonc has comments and trailing commas; TypeScript's own
// tsconfig reader parses exactly that format.
function readWranglerConfig(): WranglerConfig {
  const file = path.join(import.meta.dirname, '../../wrangler.jsonc');
  const parsed = ts.parseConfigFileTextToJson(file, readFileSync(file, 'utf8'));
  if (parsed.error) {
    throw new Error('wrangler.jsonc did not parse');
  }
  return parsed.config as WranglerConfig;
}

const config = readWranglerConfig();
const environments = { local: config, ...config.env };

describe('wrangler.jsonc (T-010, T-066)', () => {
  it.each(Object.entries(environments))(
    '%s maps every cron schedule to exactly one job name',
    (_name, environment) => {
      const mapped = Object.keys(environment.vars?.CRON_JOBS ?? {}).sort();
      expect(mapped).toEqual([...config.triggers.crons].sort());
    },
  );

  it.each(['preview', 'production'] as const)(
    '%s names only its own resources (D-008) and keeps R2 in the EU',
    (name) => {
      const environment = config.env[name];
      const names = [
        ...(environment.d1_databases ?? []).map((d) => d.database_name),
        ...(environment.r2_buckets ?? []).map((b) => b.bucket_name),
        ...(environment.queues?.producers ?? []).map((q) => q.queue),
      ];
      expect(names.length).toBeGreaterThan(0);
      for (const resource of names) {
        expect(resource.startsWith(`yafa-portal-${name}-`)).toBe(true);
      }
      for (const bucket of environment.r2_buckets ?? []) {
        expect(bucket.jurisdiction).toBe('eu');
      }
    },
  );
});
