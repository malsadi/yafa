import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from './action-button';
import { CancelEventForm } from './cancel-event-form';

/** D-181: the cancel button, opening the form that asks for the reason. */
export function CancelControl({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'].status;
  const [cancelling, setCancelling] = useState(false);
  if (cancelling)
    return (
      <CancelEventForm
        event={event}
        onDone={() => {
          setCancelling(false);
        }}
      />
    );
  return (
    <ActionButton
      label={t.cancel}
      onClick={() => {
        setCancelling(true);
      }}
    />
  );
}
