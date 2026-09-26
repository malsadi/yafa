/** Query keys: every Treasury query of a unit starts with the unit's, so one change refreshes them all. */
export const treasuryKey = (unitId: string, ...rest: unknown[]) =>
  ['treasury', unitId, ...rest] as const;
