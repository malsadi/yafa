/** Brief 25 D1 and D-217 (O-168): what the system health screen shows, from the portal's own records. */
export interface SystemHealth {
  /** Every scheduled job, with its last run and outcome (null if it has not run yet). */
  jobs: {
    jobName: string;
    schedule: string;
    lastRunAt: string | null;
    outcome: 'success' | 'failure' | null;
    errorCode: string | null;
  }[];
  /** Phone alerts never delivered, kept for the administrator's period (D-050) — kind only. */
  pushFailures: {
    count: number;
    latest: { alertKind: string; lastStatus: string; failedAt: string }[];
  };
  /** Storage used per unit, from the file records. */
  storage: { unitId: string; nameEn: string; nameAr: string; files: number; bytes: number }[];
}
