import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface HandoverChecklistProps {
  handover: HandoverRecord;
  /** Ticking is open to the named officers and register officers until confirmation starts. */
  canTick: boolean;
  /** Removing is open to register officers until confirmation starts (D-067). */
  canRemove: boolean;
  busy: boolean;
  onTick: (itemId: string, ticked: boolean) => void;
  onRemove: (itemId: string) => void;
}

/** Brief 14 C2 and D-067: what passes from the outgoing to the incoming officer. */
export function HandoverChecklist(props: HandoverChecklistProps) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].handovers;
  if (props.handover.items.length === 0) return <p>{t.noItems}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {props.handover.items.map((item) => {
        const name = { en: item.nameEn, ar: item.nameAr }[language];
        return (
          <li key={item.id} className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.tickedAt !== null}
                disabled={!props.canTick || props.busy}
                onChange={(event) => {
                  props.onTick(item.id, event.target.checked);
                }}
              />
              {name}
            </label>
            {props.canRemove && (
              <button
                type="button"
                className="text-sm underline"
                disabled={props.busy}
                onClick={() => {
                  props.onRemove(item.id);
                }}
              >
                {fillText(t.removeItem, { name })}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
