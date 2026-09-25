import { useState } from 'react';
import type { ListItem } from '../../../../shared/administration-panel/lists';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { ListItemActions } from './list-item-actions';
import { ListItemForm } from './list-item-form';
import type { ListItemInput } from './lists.api';

interface ListItemRowProps {
  item: ListItem;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  onRename: (input: ListItemInput) => void;
  onMove: (step: -1 | 1) => void;
  onRetire: () => void;
  onRestore: () => void;
}

/** Brief 25 B3; D-070, D-071, D-076: one item — renamed, moved, or retired. */
export function ListItemRow(props: ListItemRowProps) {
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].lists;
  const [editing, setEditing] = useState(false);
  const { item } = props;
  const withColour = item.list === 'calendar-colours';
  return (
    <li
      className={`flex flex-col gap-2 rounded border p-3 ${item.retiredAt ? 'border-dashed text-slate-500' : 'border-slate-300'}`}
    >
      <p className="flex items-center gap-2">
        {item.colour && (
          <span aria-hidden className="h-4 w-4 rounded" style={{ backgroundColor: item.colour }} />
        )}
        <span className="font-medium">{{ en: item.nameEn, ar: item.nameAr }[language]}</span>
        {item.retiredAt && <span className="rounded bg-slate-200 px-2 text-sm">{t.retired}</span>}
      </p>
      {editing ? (
        <ListItemForm
          initial={{ nameEn: item.nameEn, nameAr: item.nameAr, colour: item.colour ?? undefined }}
          withColour={withColour}
          busy={props.busy}
          submitLabel={t.save}
          onSubmit={(input) => {
            props.onRename(input);
            setEditing(false);
          }}
          onCancel={() => {
            setEditing(false);
          }}
        />
      ) : (
        <ListItemActions
          {...props}
          onEdit={() => {
            setEditing(true);
          }}
        />
      )}
    </li>
  );
}
