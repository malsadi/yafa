import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { UnitForm } from './unit-form';
import { UnitRow } from './unit-row';
import { useUnits } from './use-units';

const NEW_BRANCH = { code: '', nameEn: '', nameAr: '', area: '', status: '' } as const;

/** Brief 25 B1 and 14 A1: the General Council and the branches, edited by the national register officer. */
export function UnitsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.units;
  const { units, create, update, refusal } = useUnits();
  if (units.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (units.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const busy = create.isPending || update.isPending;
  const refusals: Partial<Record<string, string>> = t.refusals;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens.units}</PageHeading>
        <p className="max-w-prose">{t.intro}</p>
        {refusal && (
          <p role="alert" className="mt-2 rounded bg-amber-100 p-3 text-amber-950">
            {refusals[refusal] ?? text.portalShell.somethingWentWrong}
          </p>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {units.data.map((unit) => (
          <UnitRow
            key={unit.id}
            unit={unit}
            busy={busy}
            onSave={(changes) => {
              update.mutate({ unitId: unit.id, changes });
            }}
          />
        ))}
      </ul>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t.addBranch}</h2>
        <UnitForm
          key={units.dataUpdatedAt}
          initial={NEW_BRANCH}
          isNational={false}
          busy={busy}
          submitLabel={t.add}
          onSubmit={(input) => {
            if ('status' in input) create.mutate(input);
          }}
        />
      </section>
    </div>
  );
}
