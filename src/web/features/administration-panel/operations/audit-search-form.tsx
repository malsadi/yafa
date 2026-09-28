import { useState } from 'react';
import type { AuditSearch } from '../../../../shared/administration-panel/audit-entry';
import { useText } from '../../../app/language/use-text';
import { AuditRecordFields, AuditWhoFields } from './audit-search-fields';

/** Brief 25 D2: search by person, service, record and dates. */
export function AuditSearchForm(props: {
  actors: { personId: string; name: string | null }[];
  onSearch: (search: AuditSearch) => void;
}) {
  const t = useText().services['administration-panel'].operations.audit;
  const [search, setSearch] = useState<AuditSearch>({});
  const set = (change: Partial<AuditSearch>) => {
    setSearch({ ...search, ...change });
  };
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSearch(search);
      }}
    >
      <AuditWhoFields search={search} actors={props.actors} set={set} />
      <AuditRecordFields search={search} set={set} />
      <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white">
        {t.search}
      </button>
    </form>
  );
}
