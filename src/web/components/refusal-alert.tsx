import { useText } from '../app/language/use-text';

interface RefusalAlertProps {
  /** The refusal's code, or null when there is nothing to explain. */
  code: string | null;
  /** The screen's texts for the codes it expects. */
  refusals: Partial<Record<string, string>>;
}

/** A refused change, explained by its code's text, or a general message for an unknown code. */
export function RefusalAlert({ code, refusals }: RefusalAlertProps) {
  const text = useText();
  if (!code) return null;
  return (
    <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
      {refusals[code] ?? text.portalShell.somethingWentWrong}
    </p>
  );
}
