import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { useRegisterUnit } from '../use-register-unit';
import { AddOfficerForm } from './add-officer-form';
import { OfficerList } from './officer-list';
import { officersOutcomeText } from './officers-outcome-text';
import { useOfficers } from './use-officers';

/** Brief 14 B1 and B3: the unit's current and upcoming officers. */
export function OfficersPage() {
  const unit = useRegisterUnit();
  const text = useText();
  const t = text.services['committee-register'].register;
  const canManage =
    useActiveSession().context.capabilities.includes('committee-register.officers.manage') &&
    unit.status === 'active';
  const { officers, add, update, end, outcome } = useOfficers(unit.id);
  if (officers.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (officers.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const busy = add.isPending || update.isPending || end.isPending;
  const windowNotSet = officers.data.some((officer) => officer.endingSoon === null);
  return (
    <div className="flex flex-col gap-4">
      {outcome && (
        <p role="status" className="rounded bg-slate-100 p-3">
          {officersOutcomeText(text, outcome)}
        </p>
      )}
      {windowNotSet && <p className="text-sm text-slate-600">{t.windowNotSet}</p>}
      <OfficerList
        officers={officers.data}
        canManage={canManage}
        busy={busy}
        onUpdate={(personId, changes) => {
          update.mutate({ personId, ...changes });
        }}
        onEnd={(termId, endDate) => {
          end.mutate({ termId, endDate });
        }}
      />
      {canManage && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t.addOfficer}</h2>
          <AddOfficerForm
            unitId={unit.id}
            busy={busy}
            onAdd={(officer) => {
              add.mutate(officer);
            }}
          />
        </section>
      )}
    </div>
  );
}
