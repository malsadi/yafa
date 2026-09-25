/** On, off, or (for a unit) following the portal-wide value. */
export type SwitchChoice = 'on' | 'off' | 'follow';

/** The choice as the API takes it: on, off, or null to follow the portal-wide value. */
export function toEnabled(choice: SwitchChoice): boolean | null {
  return choice === 'follow' ? null : choice === 'on';
}
