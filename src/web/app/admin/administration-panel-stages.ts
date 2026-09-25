/** Brief section 25: the Administration panel's four stages, in order. */
export const ADMINISTRATION_PANEL_STAGES = [
  'access-and-permissions',
  'organisation',
  'configuration',
  'operations',
] as const;

export type AdministrationPanelStage = (typeof ADMINISTRATION_PANEL_STAGES)[number];
