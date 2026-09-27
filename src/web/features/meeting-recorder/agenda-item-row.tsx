import { useState } from 'react';
import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { AgendaItemButtons } from './agenda-item-buttons';
import { AgendaItemForm } from './agenda-item-form';
import { useMeetingAction } from './use-meeting-action';

/** D-204: one agenda item — marked if raised in the meeting — with the changes allowed now. */
export function AgendaItemRow(props: {
  item: AgendaItemRecord;
  base: string;
  editable: boolean;
  removable: boolean;
  onUp: (() => void) | null;
  onDown: (() => void) | null;
}) {
  const t = useText().services['meeting-recorder'];
  const remove = useMeetingAction();
  const [editing, setEditing] = useState(false);
  const { item } = props;
  const path = `${props.base}/agenda/${item.id}`;
  const edit = () => {
    setEditing(true);
  };
  const removeItem = () => {
    remove.mutate({ path: `${path}/remove`, method: 'POST' });
  };
  if (editing)
    return (
      <li>
        <AgendaItemForm
          path={path}
          item={item}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  return (
    <li className="flex flex-col gap-1 rounded border border-slate-200 p-2 text-sm">
      <span className="font-medium">
        {item.raisedInMeeting ? fillText(t.reportPdf.raised, { title: item.title }) : item.title}
      </span>
      {item.note && <span className="text-slate-600">{item.note}</span>}
      <ErrorAlert error={remove.error} refusals={t.refusals} />
      <AgendaItemButtons
        onUp={props.onUp}
        onDown={props.onDown}
        onChange={props.editable ? edit : null}
        onRemove={props.removable ? removeItem : null}
        busy={remove.isPending}
      />
    </li>
  );
}
