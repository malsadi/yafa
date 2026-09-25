import type { ListItem } from '../../../../shared/administration-panel/lists';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { RetireListItemControl } from './retire-list-item-control';

interface ListItemActionsProps {
  item: ListItem;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onEdit: () => void;
  onMove: (step: -1 | 1) => void;
  onRetire: () => void;
}

/** Move an item up or down (D-071), rename it, or retire it (D-070). */
export function ListItemActions(props: ListItemActionsProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].lists;
  const name = { en: props.item.nameEn, ar: props.item.nameAr }[language];
  const button = 'rounded border px-3 py-1 text-sm disabled:opacity-50';
  const actions = [
    {
      label: t.moveUp,
      aria: t.moveUpItem,
      off: props.isFirst,
      act: () => {
        props.onMove(-1);
      },
    },
    {
      label: t.moveDown,
      aria: t.moveDownItem,
      off: props.isLast,
      act: () => {
        props.onMove(1);
      },
    },
    { label: t.rename, aria: t.renameItem, off: false, act: props.onEdit },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={button}
          disabled={props.busy || action.off}
          aria-label={fillText(action.aria, { name })}
          onClick={action.act}
        >
          {action.label}
        </button>
      ))}
      {!props.item.retiredAt && (
        <RetireListItemControl name={name} busy={props.busy} onRetire={props.onRetire} />
      )}
    </div>
  );
}
