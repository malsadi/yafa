import type { AdminText } from './admin-texts';

/** Brief 25 C5: the texts the administrator writes, as the Texts screen shows them. */
export interface TextsView {
  /** Every version, newest first; the first is current. Empty until one is published (D-024). */
  privacyNotice: { id: string; textEn: string; textAr: string | null; createdAt: string }[];
  accessNotActive: AdminText | null;
  help: AdminText | null;
}
