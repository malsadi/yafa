import type { ListItem, ListKey } from '../../../../shared/administration-panel/lists';
import { useText } from '../../../app/language/use-text';
import { movedOne } from '../../../components/moved-one';
import { RefusalAlert } from '../../../components/refusal-alert';
import { ListItemForm } from './list-item-form';
import { ListItemRow } from './list-item-row';
import type { ListItemInput } from './lists.api';

const EMPTY = { nameEn: '', nameAr: '' };

interface ListSectionProps {
  list: ListKey;
  items: ListItem[];
  refusal: string | null;
  busy: boolean;
  onAdd: (input: ListItemInput) => void;
  onRename: (itemId: string, input: ListItemInput) => void;
  onOrder: (itemIds: string[]) => void;
  onRetire: (itemId: string) => void;
  onRestore: (itemId: string) => void;
}

/** Brief 25 B3: one list's items in the administrator's order, and a new item added last. */
export function ListSection(props: ListSectionProps) {
  const t = useText().services['administration-panel'].lists;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.names[props.list]}</h2>
      <RefusalAlert code={props.refusal} refusals={t.refusals} />
      {props.items.length === 0 ? (
        <p>{t.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {props.items.map((item, index) => (
            <ListItemRow
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === props.items.length - 1}
              busy={props.busy}
              onRename={(input) => {
                props.onRename(item.id, input);
              }}
              onMove={(step) => {
                props.onOrder(
                  movedOne(
                    props.items.map((x) => x.id),
                    index,
                    step,
                  ),
                );
              }}
              onRetire={() => {
                props.onRetire(item.id);
              }}
              onRestore={() => {
                props.onRestore(item.id);
              }}
            />
          ))}
        </ul>
      )}
      <ListItemForm
        key={props.items.length}
        initial={EMPTY}
        withColour={props.list === 'calendar-colours'}
        busy={props.busy}
        submitLabel={t.add}
        onSubmit={props.onAdd}
      />
    </section>
  );
}
