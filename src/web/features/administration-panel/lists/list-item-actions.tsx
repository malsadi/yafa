import type { ListItem } from '../../../../shared/administration-panel/lists';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { MoveButtons } from '../../../components/move-buttons';
import { RetireListItemControl } from './retire-list-item-control';

interface ListItemActionsProps {
  item: ListItem;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onEdit: () => void;
  onMove: (step: -1 | 1) => void;
  onRetire: () => void;
  onRestore: () => void;
}

/** Move an item up or down (D-071), rename it, retire it (D-070), or bring it back (D-078). */
export function ListItemActions(props: ListItemActionsProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].lists;
  const name = { en: props.item.nameEn, ar: props.item.nameAr }[language];
  const button = 'rounded border px-3 py-1 text-sm disabled:opacity-50';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MoveButtons
        name={name}
        isFirst={props.isFirst}
        isLast={props.isLast}
        busy={props.busy}
        onMove={props.onMove}
      />
      <button
        type="button"
        className={button}
        disabled={props.busy}
        aria-label={fillText(t.renameItem, { name })}
        onClick={props.onEdit}
      >
        {t.rename}
      </button>
      {props.item.retiredAt ? (
        <button
          type="button"
          className={button}
          disabled={props.busy}
          aria-label={fillText(t.restoreItem, { name })}
          onClick={props.onRestore}
        >
          {t.restore}
        </button>
      ) : (
        <RetireListItemControl name={name} busy={props.busy} onRetire={props.onRetire} />
      )}
    </div>
  );
}
