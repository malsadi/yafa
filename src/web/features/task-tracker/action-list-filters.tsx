import { useState } from 'react';
import type { TaskOwnerChoice } from '../../../shared/task-tracker/task-records';
import { TASK_STATUSES } from '../../../shared/task-tracker/task-statuses';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import type { ActionListFilters } from './task-tracker.api';

/** Brief 18 B2: filter the action list by owner, status or event. */
export function ActionListFiltersForm(props: {
  initial: ActionListFilters;
  owners: TaskOwnerChoice[];
  events: { id: string; name: string }[];
  onApply: (filters: ActionListFilters) => void;
}) {
  const t = useText().services['task-tracker'];
  const [filters, setFilters] = useState(props.initial);
  const set = (key: keyof ActionListFilters) => (value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };
  return (
    <form
      aria-label={t.actionList.filters}
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onApply(filters);
      }}
    >
      <SelectField
        label={t.actionList.owner}
        value={filters.ownerPersonId}
        optional
        emptyLabel={t.actionList.any}
        options={props.owners.map((o) => ({ value: o.personId, label: o.name }))}
        onChange={set('ownerPersonId')}
      />
      <SelectField
        label={t.actionList.status}
        value={filters.status}
        optional
        emptyLabel={t.actionList.any}
        options={TASK_STATUSES.map((s) => ({ value: s, label: t.statuses[s] }))}
        onChange={set('status')}
      />
      <SelectField
        label={t.actionList.event}
        value={filters.eventId}
        optional
        emptyLabel={t.actionList.any}
        options={props.events.map((e) => ({ value: e.id, label: e.name }))}
        onChange={set('eventId')}
      />
      <button type="submit" className="rounded border border-slate-400 px-3 py-2">
        {t.actionList.apply}
      </button>
    </form>
  );
}
