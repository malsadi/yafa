import { useEffect } from 'react';
import { useBranding } from './use-branding';

/**
 * D-082: puts the branding's main and accent colours where the portal's
 * headings and rules read them (`brand-heading`, `brand-rule`). Draws nothing.
 */
export function BrandingColours() {
  const branding = useBranding();
  const { mainColour, accentColour } = branding.data ?? { mainColour: null, accentColour: null };
  useEffect(() => {
    const root = document.documentElement.style;
    const set = (name: string, colour: string | null) => {
      if (colour) root.setProperty(name, colour);
      else root.removeProperty(name);
    };
    set('--brand-main', mainColour);
    set('--brand-accent', accentColour);
    return () => {
      root.removeProperty('--brand-main');
      root.removeProperty('--brand-accent');
    };
  }, [mainColour, accentColour]);
  return null;
}
