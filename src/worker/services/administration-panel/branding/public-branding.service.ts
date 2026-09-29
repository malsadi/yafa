import { INSTALL_ICONS } from '../../../../shared/administration-panel/branding-files';
import { readBranding } from './branding.service';

/**
 * D-036 and D-088: the install file, built from branding — the organisation's
 * name, its main colour, and the two square logos (D-223). Null until the
 * name is set (rule 5); the browser then has no install file to offer.
 */
export async function buildInstallFile(db: D1Database): Promise<object | null> {
  const branding = await readBranding(db);
  if (!branding.organisationName) return null;
  const icon = (src: string, size: string) => ({
    src,
    sizes: `${size}x${size}`,
    type: 'image/png',
  });
  return {
    name: branding.organisationName.en,
    short_name: branding.organisationName.en,
    lang: 'en',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    ...(branding.mainColour ? { theme_color: branding.mainColour } : {}),
    icons: [icon(INSTALL_ICONS['192'], '192'), icon(INSTALL_ICONS['512'], '512')],
  };
}
