import { useText } from '../app/language/use-text';
import { fillText } from '../text/fill-text';

interface RefusalAlertProps {
  /** The refusal's code, or null when there is nothing to explain. */
  code: string | null;
  /** The screen's texts for the codes it expects. */
  refusals: Partial<Record<string, string>>;
  /** Numbers the refusal's text states (D-108). */
  values?: Record<string, number>;
}

/** A refused change, explained by its code's text — the screen's own, then the portal-wide ones — or a general message. */
export function RefusalAlert({ code, refusals, values }: RefusalAlertProps) {
  const text = useText();
  if (!code) return null;
  const portalWide: Partial<Record<string, string>> = text.portalShell.refusals;
  return (
    <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
      {fillText(
        refusals[code] ?? portalWide[code] ?? text.portalShell.somethingWentWrong,
        values ?? {},
      )}
    </p>
  );
}
