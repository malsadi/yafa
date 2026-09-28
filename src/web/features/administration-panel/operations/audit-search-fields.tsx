import type { AuditSearch } from '../../../../shared/administration-panel/audit-entry';
import { SERVICES, type ServiceSlug } from '../../../../shared/core/services';
import { useText } from '../../../app/language/use-text';
import { SelectField } from '../../../components/select-field';
import { TextField } from '../../../components/text-field';

type Set = (change: Partial<AuditSearch>) => void;
const orNone = (value: string) => (value === '' ? undefined : value);

/** Brief 25 D2: who, and in which service. */
export function AuditWhoFields(props: {
  search: AuditSearch;
  actors: { personId: string; name: string | null }[];
  set: Set;
}) {
  const text = useText();
  const t = text.services['administration-panel'].operations.audit;
  return (
    <>
      <SelectField
        label={t.person}
        value={props.search.personId ?? ''}
        optional
        emptyLabel={t.anyone}
        options={props.actors.map((a) => ({ value: a.personId, label: a.name ?? a.personId }))}
        onChange={(personId) => {
          props.set({ personId: orNone(personId) });
        }}
      />
      <SelectField
        label={t.service}
        value={props.search.service ?? ''}
        optional
        emptyLabel={t.allServices}
        options={SERVICES.map((x) => ({ value: x.slug, label: text.services[x.slug].name }))}
        onChange={(service) => {
          props.set({ service: orNone(service) as ServiceSlug | undefined });
        }}
      />
    </>
  );
}

/** Brief 25 D2: which record, and between which dates. */
export function AuditRecordFields(props: { search: AuditSearch; set: Set }) {
  const t = useText().services['administration-panel'].operations.audit;
  const field = (key: 'entityType' | 'entityId' | 'from' | 'to', label: string, date = false) => (
    <TextField
      label={label}
      type={date ? 'date' : 'text'}
      optional
      value={props.search[key] ?? ''}
      onChange={(value) => {
        props.set({ [key]: orNone(value) });
      }}
    />
  );
  return (
    <>
      {field('entityType', t.entityType)}
      {field('entityId', t.entityId)}
      {field('from', t.from, true)}
      {field('to', t.to, true)}
    </>
  );
}
