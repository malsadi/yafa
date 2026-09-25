import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface RetireListItemControlProps {
  name: string;
  busy: boolean;
  onRetire: () => void;
}

/** D-070: retire an item, after asking once more; it can be brought back (D-078). */
export function RetireListItemControl({ name, busy, onRetire }: RetireListItemControlProps) {
  const t = useText().services['administration-panel'].lists;
  const [confirming, setConfirming] = useState(false);
  const button = 'rounded border px-3 py-1 text-sm disabled:opacity-50';
  if (!confirming) {
    return (
      <button
        type="button"
        className={button}
        disabled={busy}
        aria-label={fillText(t.retireItem, { name })}
        onClick={() => {
          setConfirming(true);
        }}
      >
        {t.retire}
      </button>
    );
  }
  return (
    <>
      <span className="text-sm">{t.retireWarning}</span>
      <button
        type="button"
        className={`${button} bg-slate-900 text-white`}
        disabled={busy}
        onClick={() => {
          onRetire();
          setConfirming(false);
        }}
      >
        {fillText(t.confirmRetire, { name })}
      </button>
      <button
        type="button"
        className={button}
        onClick={() => {
          setConfirming(false);
        }}
      >
        {t.cancel}
      </button>
    </>
  );
}
