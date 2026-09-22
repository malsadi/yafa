/**
 * The scope value meaning "the portal-wide default", used by every table
 * that stores a value which can also be overridden per unit (settings,
 * service switches — brief section 8.1). Not a real unit id and never
 * entered by the data administrator: a fixed structural discriminator, not
 * configuration. See docs/decisions.md T-033.
 */
export const NATIONAL_SCOPE = '__national__';

export function isNationalScope(scope: string): boolean {
  return scope === NATIONAL_SCOPE;
}
