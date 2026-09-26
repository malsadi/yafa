import { useState } from 'react';
import type { LoanRecord } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { LoanActionButtons } from './loan-action-buttons';
import { LoanForm } from './loan-form';
import { ReturnForm } from './return-form';
import type { useEquipment } from './use-equipment';

type Actions = Pick<ReturnType<typeof useEquipment>, 'correct' | 'recordReturn'>;

/** D-109: correct an open loan, or record its return (D-099), from the version read. */
export function LoanActions({ loan, actions }: { loan: LoanRecord; actions: Actions }) {
  const t = useText().services['resources-library'].equipment;
  const [open, setOpen] = useState<'correct' | 'return' | null>(null);
  const ids = { equipmentId: loan.equipmentId, loanId: loan.id, version: loan.version };
  const done = () => {
    setOpen(null);
  };
  if (open === 'correct') {
    return (
      <LoanForm
        initial={loan}
        busy={actions.correct.isPending}
        error={actions.correct.error}
        onCancel={done}
        onSave={(details) => {
          actions.correct.mutate({ ...ids, loan: details }, { onSuccess: done });
        }}
      />
    );
  }
  if (open === 'return') {
    return (
      <ReturnForm
        busy={actions.recordReturn.isPending}
        onCancel={done}
        onSave={(returnedOn) => {
          actions.recordReturn.mutate({ ...ids, returnedOn }, { onSuccess: done });
        }}
      />
    );
  }
  return <LoanActionButtons labels={t} onOpen={setOpen} />;
}
