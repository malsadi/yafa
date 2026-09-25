import type { TextBundle } from '../../text';

/** A setting's on-screen name, from its own service's text file. */
export function settingName(text: TextBundle, key: string): string {
  const slug = key.split('.')[0] ?? '';
  const service = (text.services as Record<string, { settings?: Record<string, string> }>)[slug];
  return service?.settings?.[key] ?? key;
}
