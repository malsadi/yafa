import type { SystemHealth } from './system-health';

/** Brief 25 D5: storage used, and objects kept in storage with no file record. */
export interface FileHousekeeping {
  storage: SystemHealth['storage'];
  orphans: {
    count: number;
    bytes: number;
    latest: { key: string; size: number; uploadedAt: string }[];
  };
  /** The age after which the nightly clean-up removes them; null while unset. */
  orphanAgeDays: number | null;
}
