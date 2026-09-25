/** Brief 25 C3: the branding set so far; each part null until the administrator sets it. */
export interface Branding {
  organisationName: { en: string; ar: string | null } | null;
  mainColour: string | null;
  accentColour: string | null;
}
