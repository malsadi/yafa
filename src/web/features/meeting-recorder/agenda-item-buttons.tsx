import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';

type Action = (() => void) | null;

/** D-204: the changes an agenda item allows now — each button shown only where it may be used. */
export function AgendaItemButtons(props: {
  onUp: Action;
  onDown: Action;
  onChange: Action;
  onRemove: Action;
  busy: boolean;
}) {
  const t = useText().services['meeting-recorder'].agenda;
  return (
    <div className="flex flex-wrap gap-2">
      {props.onUp && <ActionButton label={t.up} onClick={props.onUp} />}
      {props.onDown && <ActionButton label={t.down} onClick={props.onDown} />}
      {props.onChange && <ActionButton label={t.change} onClick={props.onChange} />}
      {props.onRemove && (
        <ActionButton label={t.remove} disabled={props.busy} onClick={props.onRemove} />
      )}
    </div>
  );
}
