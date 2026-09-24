/** D-066: an election's statuses, with the owner's exact labels. */
export const ElectionStatus = {
  Draft: 'Draft',
  Confirmed: 'Confirmed',
} as const;

export type ElectionStatus = (typeof ElectionStatus)[keyof typeof ElectionStatus];
