import type { TextBundle } from '../../text';

/** A capability's on-screen name, from its own service's text file. */
export function capabilityName(text: TextBundle, capability: string): string {
  const slug = capability.split('.')[0] ?? '';
  const service = (text.services as Record<string, { capabilities?: Record<string, string> }>)[
    slug
  ];
  return service?.capabilities?.[capability] ?? capability;
}
