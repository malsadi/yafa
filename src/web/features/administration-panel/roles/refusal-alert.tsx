import { useText } from '../../../app/language/use-text';

/** A refused change, explained by its code's text on the roles screen. */
export function RefusalAlert({ code }: { code: string | null }) {
  const text = useText();
  const refusals: Partial<Record<string, string>> =
    text.services['administration-panel'].roles.refusals;
  if (!code) return null;
  return (
    <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
      {refusals[code] ?? text.portalShell.somethingWentWrong}
    </p>
  );
}
