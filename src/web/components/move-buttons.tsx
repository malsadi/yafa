import { useText } from '../app/language/use-text';
import { fillText } from '../text/fill-text';

interface MoveButtonsProps {
  name: string;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onMove: (step: -1 | 1) => void;
}

/** Move an item one place up or down in an order someone sets (D-071). */
export function MoveButtons({ name, isFirst, isLast, busy, onMove }: MoveButtonsProps) {
  const t = useText().portalShell.order;
  const button = 'rounded border px-3 py-1 text-sm disabled:opacity-50';
  return (
    <>
      <button
        type="button"
        className={button}
        disabled={busy || isFirst}
        aria-label={fillText(t.moveUpItem, { name })}
        onClick={() => {
          onMove(-1);
        }}
      >
        {t.moveUp}
      </button>
      <button
        type="button"
        className={button}
        disabled={busy || isLast}
        aria-label={fillText(t.moveDownItem, { name })}
        onClick={() => {
          onMove(1);
        }}
      >
        {t.moveDown}
      </button>
    </>
  );
}
