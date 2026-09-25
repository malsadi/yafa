import { useParams } from 'react-router';
import { BilingualNameForm } from '../../../components/bilingual-name-form';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { HandoverChecklist } from './handover-checklist';
import { HandoverConfirm } from './handover-confirm';
import { HandoverHeader } from './handover-header';
import { handoverStatus } from './handover-status';
import { addItem, removeItem, tickItem } from './handovers.api';
import { useHandover } from './use-handover';

/** Brief 14 C2 and D-067: one handover — its checklist, and each officer's confirmation. */
export function HandoverPage() {
  const { handoverId = '' } = useParams();
  const text = useText();
  const t = text.services['committee-register'].handovers;
  const { context } = useActiveSession();
  const { handover, change, refusal } = useHandover(handoverId);
  if (handover.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (handover.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const h = handover.data;
  const open = handoverStatus(h) === 'open';
  const manages = context.capabilities.includes('committee-register.handovers.manage');
  const named = [h.outgoingPersonId, h.incomingPersonId].includes(context.personId);
  const busy = change.isPending;
  const run = change.mutate;
  return (
    <div className="flex flex-col gap-4">
      <HandoverHeader handover={h} />
      <RefusalAlert code={refusal} refusals={t.refusals} />
      <h2 className="text-lg font-semibold">{t.checklist}</h2>
      <HandoverChecklist
        handover={h}
        canTick={open && (manages || named)}
        canRemove={open && manages}
        busy={busy}
        onTick={(itemId, ticked) => {
          run((r) => tickItem(r, { handoverId, itemId, ticked }));
        }}
        onRemove={(itemId) => {
          run((r) => removeItem(r, handoverId, itemId));
        }}
      />
      {open && manages && (
        <BilingualNameForm
          key={h.items.length}
          initial={{ nameEn: '', nameAr: '' }}
          busy={busy}
          submitLabel={t.addItem}
          onSubmit={(names) => {
            run((r) => addItem(r, handoverId, names));
          }}
        />
      )}
      <HandoverConfirm handover={h} personId={context.personId} busy={busy} onConfirm={run} />
    </div>
  );
}
