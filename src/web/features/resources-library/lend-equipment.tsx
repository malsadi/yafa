import { useState } from 'react';
import { todayInLondon } from '../../app/language/today-in-london';
import { useText } from '../../app/language/use-text';
import { LoanForm } from './loan-form';
import type { useEquipment } from './use-equipment';

/** Brief 16 C2 and D-109: lend an item; the date borrowed starts as today. */
export function LendEquipment(props: {
  equipmentId: string;
  lend: ReturnType<typeof useEquipment>['lend'];
}) {
  const t = useText().services['resources-library'].equipment;
  const [lending, setLending] = useState(false);
  const done = () => {
    setLending(false);
  };
  if (!lending) {
    return (
      <button
        type="button"
        className="self-start rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          setLending(true);
        }}
      >
        {t.lend}
      </button>
    );
  }
  const today = todayInLondon();
  return (
    <LoanForm
      initial={{ borrower: '', quantity: 1, borrowedOn: today, dueBack: today }}
      busy={props.lend.isPending}
      error={props.lend.error}
      onCancel={done}
      onSave={(loan) => {
        props.lend.mutate({ equipmentId: props.equipmentId, loan }, { onSuccess: done });
      }}
    />
  );
}
