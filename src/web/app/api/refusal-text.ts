import type { TextBundle } from '../../text';

/**
 * A refusal's code in words: the screen's own text for it, then the
 * portal-wide one (no permission, too many requests, maintenance), then
 * the general error (D-224).
 */
export function refusalText(
  text: TextBundle,
  refusals: Partial<Record<string, string>>,
  code: string,
): string {
  const portalWide: Partial<Record<string, string>> = text.portalShell.refusals;
  return refusals[code] ?? portalWide[code] ?? text.portalShell.somethingWentWrong;
}
