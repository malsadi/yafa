/** Brief section 25: the Administration panel's four stages, in order. */
export const ADMINISTRATION_PANEL_STAGES = [
  'access-and-permissions',
  'organisation',
  'configuration',
  'operations',
] as const;

export type AdministrationPanelStage = (typeof ADMINISTRATION_PANEL_STAGES)[number];

/**
 * Brief section 25 build notes: the admin area is "visible only to people
 * with at least one administration capability". A UI hint (T-042) — each
 * admin screen's own route checks its own capability on the server.
 */
export function hasAdministrationCapability(capabilities: readonly string[]): boolean {
  return capabilities.some((capability) => capability.startsWith('administration-panel.'));
}
