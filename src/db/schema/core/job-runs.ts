import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 11/15 D1: "last run and outcome of every scheduled job" for
// the system health screen (T-016). One row per job name, overwritten on
// every run — the brief asks for the *last* run, not a full history, so
// this is current state like `maintenance_mode`/`service_switches`, not an
// append-only log. `error_code` only, never a message (brief section 12:
// no personal data in logs; T-051's `core/errors` pattern).
export const jobRuns = sqliteTable('job_runs', {
  jobName: text('job_name').primaryKey(),
  lastRunAt: text('last_run_at').notNull(),
  outcome: text('outcome').notNull(),
  errorCode: text('error_code'),
});
