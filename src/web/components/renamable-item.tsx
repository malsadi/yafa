import { useState } from 'react';
import { useLanguage } from '../app/language/use-language';
import { useText } from '../app/language/use-text';
import { fillText } from '../text/fill-text';
import { BilingualNameForm, type BilingualNames } from './bilingual-name-form';

interface RenamableItemProps {
  names: BilingualNames;
  /** Shown after the name, such as a role's designation. */
  note?: string;
  busy: boolean;
  onRename: (names: BilingualNames) => void;
}

/** A named item in the officer's language, renamed in place in both languages. */
export function RenamableItem({ names, note, busy, onRename }: RenamableItemProps) {
  const { language } = useLanguage();
  const t = useText().portalShell.bilingualName;
  const [editing, setEditing] = useState(false);
  const name = { en: names.nameEn, ar: names.nameAr }[language];
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>
          <span className="font-medium">{name}</span>
          {note && ` · ${note}`}
        </p>
        {!editing && (
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            aria-label={fillText(t.renameItem, { name })}
            onClick={() => {
              setEditing(true);
            }}
          >
            {t.rename}
          </button>
        )}
      </div>
      {editing && (
        <BilingualNameForm
          initial={names}
          busy={busy}
          submitLabel={t.save}
          onSubmit={(renamed) => {
            onRename(renamed);
            setEditing(false);
          }}
          onCancel={() => {
            setEditing(false);
          }}
        />
      )}
    </li>
  );
}
