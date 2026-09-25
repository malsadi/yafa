import { useText } from '../../../app/language/use-text';

/** The two changes a register officer can make to a current officer's entry. */
export function OfficerActionButtons(props: { onEdit: () => void; onEnd: () => void }) {
  const t = useText().services['committee-register'].register;
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="rounded border px-3 py-1" onClick={props.onEdit}>
        {t.correctDetails}
      </button>
      <button type="button" className="rounded border px-3 py-1" onClick={props.onEnd}>
        {t.endTerm}
      </button>
    </div>
  );
}
