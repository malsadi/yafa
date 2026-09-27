import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { AgendaItemForm } from './agenda-item-form';

/** D-204: an item added — or, once the meeting is held, a point raised in it. */
export function AgendaItemAdder(props: { base: string; raised: boolean }) {
  const t = useText().services['meeting-recorder'].agenda;
  const [adding, setAdding] = useState(false);
  if (adding)
    return (
      <AgendaItemForm
        path={`${props.base}/agenda`}
        onDone={() => {
          setAdding(false);
        }}
      />
    );
  return (
    <ActionButton
      label={props.raised ? t.addRaised : t.add}
      onClick={() => {
        setAdding(true);
      }}
    />
  );
}
