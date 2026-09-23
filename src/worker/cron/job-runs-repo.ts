export interface JobRunOutcome {
  jobName: string;
  outcome: 'success' | 'failure';
  errorCode?: string;
}

/**
 * Upserts the one row for this job name (T-016) — raw SQL, since an
 * `ON CONFLICT ... DO UPDATE` upsert isn't cleanly expressed through
 * Drizzle's query builder (T-034's precedent for the same shape).
 */
export async function recordJobRun(db: D1Database, params: JobRunOutcome): Promise<void> {
  await db
    .prepare(
      `INSERT INTO job_runs (job_name, last_run_at, outcome, error_code)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (job_name) DO UPDATE SET
         last_run_at = excluded.last_run_at,
         outcome = excluded.outcome,
         error_code = excluded.error_code`,
    )
    .bind(params.jobName, new Date().toISOString(), params.outcome, params.errorCode ?? null)
    .run();
}
