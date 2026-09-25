import type { CurrentOfficerRecord } from '../../../../shared/committee-register/officer-record';
import { useText } from '../../../app/language/use-text';
import { OfficerRow } from './officer-row';

interface OfficerListProps {
  officers: CurrentOfficerRecord[];
  canManage: boolean;
  busy: boolean;
  onUpdate: (personId: string, changes: { name: string; phone: string }) => void;
  onEnd: (termId: string, endDate: string) => void;
}

/** Brief 14 B1: the unit's officers, or a note that there are none yet. */
export function OfficerList({ officers, canManage, busy, onUpdate, onEnd }: OfficerListProps) {
  const t = useText().services['committee-register'].register;
  if (officers.length === 0) return <p>{t.noOfficers}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {officers.map((officer) => (
        <OfficerRow
          key={officer.termId}
          officer={officer}
          canManage={canManage}
          busy={busy}
          onUpdate={(changes) => {
            onUpdate(officer.personId, changes);
          }}
          onEnd={(endDate) => {
            onEnd(officer.termId, endDate);
          }}
        />
      ))}
    </ul>
  );
}
