import type { CurrentOfficerRecord } from '../../../../shared/committee-register/officer-record';
import { OfficerActions } from './officer-actions';
import { OfficerSummary } from './officer-summary';

interface OfficerRowProps {
  officer: CurrentOfficerRecord;
  canManage: boolean;
  busy: boolean;
  onUpdate: (changes: { name: string; phone: string }) => void;
  onEnd: (endDate: string) => void;
}

/** Brief 14 B1 and B3: one officer's term, highlighted when it ends soon. */
export function OfficerRow({ officer, canManage, busy, onUpdate, onEnd }: OfficerRowProps) {
  const border = officer.endingSoon ? 'border-amber-500 bg-amber-50' : 'border-slate-300';
  return (
    <li className={`flex flex-col gap-2 rounded border p-3 ${border}`}>
      <OfficerSummary officer={officer} />
      {canManage && (
        <OfficerActions
          person={{ name: officer.name, phone: officer.phone }}
          busy={busy}
          onUpdate={onUpdate}
          onEnd={onEnd}
        />
      )}
    </li>
  );
}
