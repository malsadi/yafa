import type { LogoPosition } from '../../shared/administration-panel/branding-files';
import type { Language } from '../../shared/core/languages';

/** What the one fixed letterhead design is filled in with (D-081). */
export interface LetterheadInput {
  language: Language;
  organisationName: string;
  mainColour: string;
  accentColour: string;
  logoPosition: LogoPosition;
  /** The logo as a `data:` URL for the PDF; null shows its place, marked. */
  logoSrc: string | null;
  logoPlaceholder: string;
  /** The unit writing: its name and letterhead address (25 B1, D-076). */
  unit: { name: string; address: string | null };
  letter: {
    paragraphs: string[];
    /** D-089: the signing officer's name, role and unit, with a space to sign. */
    signer: { name: string; role: string; unit: string };
  };
}
