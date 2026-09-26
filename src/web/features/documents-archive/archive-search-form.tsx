import { useState } from 'react';
import type {
  ArchiveCategory,
  ArchiveUnit,
} from '../../../shared/documents-archive/archive-document';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import { useText } from '../../app/language/use-text';
import type { ArchiveSearchFields } from './archive.api';
import { ArchiveDateFields } from './archive-date-fields';
import { useNamedOptions } from './use-named-options';

interface ArchiveSearchFormProps {
  initial: ArchiveSearchFields;
  categories: ArchiveCategory[];
  units: ArchiveUnit[];
  onSearch: (search: ArchiveSearchFields) => void;
}

/** Brief 15 B1 (D-097): search by title, category, branch, and either date. */
export function ArchiveSearchForm(props: ArchiveSearchFormProps) {
  const t = useText().services['documents-archive'].search;
  const named = useNamedOptions();
  const [search, setSearch] = useState(props.initial);
  const set = (field: keyof ArchiveSearchFields) => (value: string) => {
    setSearch((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSearch(search);
      }}
    >
      <TextField label={t.title} value={search.title} onChange={set('title')} optional />
      <SelectField
        label={t.category}
        value={search.categoryId}
        onChange={set('categoryId')}
        options={named(props.categories)}
        emptyLabel={t.any}
        optional
      />
      <SelectField
        label={t.unit}
        value={search.unitId}
        onChange={set('unitId')}
        options={named(props.units)}
        emptyLabel={t.any}
        optional
      />
      <ArchiveDateFields search={search} set={set} />
      <button type="submit" className="self-end rounded bg-slate-800 px-4 py-2 text-white">
        {t.submit}
      </button>
    </form>
  );
}
