import type { BrandingFileSlot, LogoPosition } from './branding-files';

/** Brief 25 C3: the branding set so far; each part null until the administrator sets it. */
export interface Branding {
  organisationName: { en: string; ar: string | null } | null;
  mainColour: string | null;
  accentColour: string | null;
  /** D-089: where the logo sits on the letterhead. */
  logoPosition: LogoPosition | null;
  /** Which branding files are uploaded (D-080, D-084). */
  files: Record<BrandingFileSlot, boolean>;
  /** The General Council, whose letterhead the preview shows (25 B1, D-076). */
  letterheadUnit: {
    nameEn: string;
    nameAr: string;
    addressEn: string | null;
    addressAr: string | null;
  } | null;
}
