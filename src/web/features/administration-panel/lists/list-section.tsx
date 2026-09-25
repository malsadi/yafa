import type { ListItem, ListKey } from '../../../../shared/administration-panel/lists';
import { useText } from '../../../app/language/use-text';
import { BilingualNameForm, type BilingualNames } from '../../../components/bilingual-name-form';
import { RenamableItem } from '../../../components/renamable-item';

const NO_NAMES = { nameEn: '', nameAr: '' };

interface ListSectionProps {
  list: ListKey;
  items: ListItem[];
  refusal: string | null;
  busy: boolean;
  onAdd: (names: BilingualNames) => void;
  onRename: (itemId: string, names: BilingualNames) => void;
}

/** Brief 25 B3: one list's items, renamed in place, and a new item added. */
export function ListSection(props: ListSectionProps) {
  const text = useText();
  const t = text.services['administration-panel'].lists;
  const refusals: Partial<Record<string, string>> = t.refusals;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.names[props.list]}</h2>
      {props.refusal && (
        <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
          {refusals[props.refusal] ?? text.portalShell.somethingWentWrong}
        </p>
      )}
      {props.items.length === 0 ? (
        <p>{t.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {props.items.map((item) => (
            <RenamableItem
              key={item.id}
              names={{ nameEn: item.nameEn, nameAr: item.nameAr }}
              busy={props.busy}
              onRename={(names) => {
                props.onRename(item.id, names);
              }}
            />
          ))}
        </ul>
      )}
      <BilingualNameForm
        key={props.items.length}
        initial={NO_NAMES}
        busy={props.busy}
        submitLabel={t.add}
        onSubmit={props.onAdd}
      />
    </section>
  );
}
