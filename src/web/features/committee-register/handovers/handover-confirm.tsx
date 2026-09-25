import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import { useText } from '../../../app/language/use-text';
import { confirmHandover } from './handovers.api';
import type { HandoverChange } from './use-handover';

interface HandoverConfirmProps {
  handover: HandoverRecord;
  personId: string;
  busy: boolean;
  onConfirm: (change: HandoverChange) => void;
}

/**
 * D-067: each named officer confirms the whole handover once. The first
 * confirmation fixes the checklist; the second completes and locks it.
 */
export function HandoverConfirm({ handover, personId, busy, onConfirm }: HandoverConfirmProps) {
  const t = useText().services['committee-register'].handovers;
  const confirmedAt =
    personId === handover.outgoingPersonId
      ? handover.outgoingConfirmedAt
      : personId === handover.incomingPersonId
        ? handover.incomingConfirmedAt
        : undefined;
  if (confirmedAt !== null) return null;
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm((r) => confirmHandover(r, handover.id));
      }}
    >
      <p className="max-w-prose">{t.confirmExplanation}</p>
      <label className="flex items-center gap-2">
        <input type="checkbox" required />
        <span>{t.confirmChecked}</span>
      </label>
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={busy}
      >
        {t.confirm}
      </button>
    </form>
  );
}
