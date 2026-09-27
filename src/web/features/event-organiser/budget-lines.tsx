import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import type { BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { ActionButton } from '../../components/action-button';
import { BudgetLineForm } from './budget-line-form';
import { BudgetLineRow } from './budget-line-row';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { useEventAction } from './use-event-action';

/** D-176 and D-187: the budget lines — added, changed and removed only in Draft; fixed once approved. */
export function BudgetLines(props: { event: EventSummary; lines: BudgetLineRecord[] }) {
  const e = useText().services['event-organiser'];
  const hints = useEventHints(props.event);
  const remove = useEventAction();
  const [editing, setEditing] = useState<string | null>(null);
  const draft = hints.manages && props.event.status === 'Draft';
  const done = () => {
    setEditing(null);
  };
  const base = `${eventPath(props.event.unitId, props.event.id)}/budget-lines`;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{e.account.budgetLines}</h4>
      <ErrorAlert error={remove.error} refusals={e.refusals} />
      <ul className="flex flex-col gap-1 text-sm">
        {props.lines.map((line) =>
          editing === line.id ? (
            <li key={line.id}>
              <BudgetLineForm event={props.event} line={line} onDone={done} />
            </li>
          ) : (
            <BudgetLineRow
              key={line.id}
              line={line}
              draft={draft}
              busy={remove.isPending}
              onChange={() => {
                setEditing(line.id);
              }}
              onRemove={() => {
                remove.mutate({ path: `${base}/${line.id}/remove`, method: 'POST' });
              }}
            />
          ),
        )}
      </ul>
      {draft && editing === null && (
        <ActionButton
          label={e.account.addLine}
          onClick={() => {
            setEditing('new');
          }}
        />
      )}
      {editing === 'new' && <BudgetLineForm event={props.event} onDone={done} />}
    </div>
  );
}
