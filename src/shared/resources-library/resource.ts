import type { Language } from '../core/languages';

/** Brief 16 A1, A2: the two kinds of ready-to-use material. */
export const RESOURCE_KINDS = ['template', 'guide'] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/** Brief 16 A1 to A3 and D-103: a template or guide, as the library lists it. */
export interface ResourceRecord {
  id: string;
  unitId: string;
  /** The General Council's, shared with every branch (A3, 7.3). */
  national: boolean;
  kind: ResourceKind;
  title: string;
  description: string | null;
  /** D-103: the language the file is in. */
  language: Language;
  fileName: string;
  retiredAt: string | null;
  version: number;
}
