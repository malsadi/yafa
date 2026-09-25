import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface OverrideLineProps {
  unit: string;
  value: string;
  busy: boolean;
  onRemove: () => void;
}

/** One unit's own value, and removing it so the portal-wide value applies again. */
export function OverrideLine({ unit, value, busy, onRemove }: OverrideLineProps) {
  const t = useText().services['administration-panel'].serviceSettings;
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm">
      {unit}: {value}
      <button type="button" className="underline" disabled={busy} onClick={onRemove}>
        {fillText(t.removeOverride, { unit })}
      </button>
    </p>
  );
}
