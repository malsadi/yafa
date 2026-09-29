/**
 * D-223: the branding files are fixed files in the project, replaced there
 * and pushed with the code. The logo for the letterhead and the Latin and
 * Arabic fonts are in `src/branding/`, bundled where they are used. The
 * square logo at the two sizes phones need to install the portal is in
 * `public/branding/`, at these fixed addresses the install file names.
 */
export const INSTALL_ICONS = {
  '192': '/branding/logo-192.png',
  '512': '/branding/logo-512.png',
} as const;

/** D-089: where the logo sits — left, centre or right, mirrored in Arabic. */
export const LOGO_POSITIONS = ['left', 'centre', 'right'] as const;

export type LogoPosition = (typeof LOGO_POSITIONS)[number];
