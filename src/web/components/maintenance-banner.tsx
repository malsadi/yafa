import { useText } from '../app/language/use-text';

/** Brief section 12: maintenance mode shows a banner while read-only. */
export function MaintenanceBanner() {
  const text = useText();
  return (
    <div role="alert" className="bg-amber-100 px-4 py-3 text-center text-amber-950">
      {text.portalShell.maintenanceBanner}
    </div>
  );
}
