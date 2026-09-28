import type { SystemHealth } from '../../../../shared/administration-panel/system-health';

export async function readJobRuns(
  db: D1Database,
): Promise<
  Map<string, { lastRunAt: string; outcome: 'success' | 'failure'; errorCode: string | null }>
> {
  const { results } = await db
    .prepare(
      'SELECT job_name AS jobName, last_run_at AS lastRunAt, outcome, error_code AS errorCode FROM job_runs',
    )
    .all<{
      jobName: string;
      lastRunAt: string;
      outcome: 'success' | 'failure';
      errorCode: string | null;
    }>();
  return new Map(results.map(({ jobName, ...run }) => [jobName, run]));
}

/** The count of undelivered phone alerts, and the latest `latest` of them. */
export async function readPushFailures(
  db: D1Database,
  latest: number,
): Promise<SystemHealth['pushFailures']> {
  const [count, newest] = await db.batch([
    db.prepare('SELECT COUNT(*) AS n FROM push_delivery_failures'),
    db
      .prepare(
        `SELECT alert_kind AS alertKind, last_status AS lastStatus, failed_at AS failedAt
         FROM push_delivery_failures ORDER BY failed_at DESC LIMIT ?`,
      )
      .bind(latest),
  ]);
  return {
    count: ((count?.results ?? [])[0] as { n: number } | undefined)?.n ?? 0,
    latest: (newest?.results ?? []) as SystemHealth['pushFailures']['latest'],
  };
}

/** Brief 25 D1, D5: storage used per unit, from the file records, the largest first. */
export async function readStorageByUnit(db: D1Database): Promise<SystemHealth['storage']> {
  const { results } = await db
    .prepare(
      `SELECT u.id AS unitId, u.name_en AS nameEn, u.name_ar AS nameAr,
         COUNT(f.id) AS files, COALESCE(SUM(f.size), 0) AS bytes
       FROM units u LEFT JOIN files f ON f.unit_id = u.id
       GROUP BY u.id ORDER BY bytes DESC, u.name_en`,
    )
    .all<SystemHealth['storage'][number]>();
  return results;
}
