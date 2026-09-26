import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import type { ArchiveSearchFields } from './archive.api';

/** D-097: which date to search by, and its range once one is chosen. */
export function ArchiveDateFields(props: {
  search: ArchiveSearchFields;
  set: (field: keyof ArchiveSearchFields) => (value: string) => void;
}) {
  const t = useText().services['documents-archive'].search;
  const { search, set } = props;
  const dates = [
    { value: 'document', label: t.documentDate },
    { value: 'filed', label: t.filedDate },
  ];
  return (
    <>
      <SelectField
        label={t.dateField}
        value={search.dateField}
        onChange={set('dateField')}
        options={dates}
        emptyLabel={t.any}
        optional
      />
      {search.dateField !== '' && (
        <>
          <TextField
            label={t.from}
            type="date"
            value={search.from}
            onChange={set('from')}
            optional
          />
          <TextField label={t.to} type="date" value={search.to} onChange={set('to')} optional />
        </>
      )}
    </>
  );
}
