import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { PeriodFilter, type Period } from './period-filter';
import { StatementActions } from './statement-actions';
import { StatementTable } from './statement-table';
import { useStatement } from './use-statement';

/** Brief 17 C2 and P9: an account's statement for any period — viewed freely, downloaded, or filed. */
export function StatementPanel({ unitId, accountId }: { unitId: string; accountId: string }) {
  const text = useText();
  const t = text.services.treasury.statements;
  const [period, setPeriod] = useState<Period | null>(null);
  const statement = useStatement(unitId, accountId, period);
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">{t.heading}</h3>
      <PeriodFilter
        initial={{ from: '', to: '' }}
        submit={t.view}
        onApply={(p) => {
          setPeriod(p.from && p.to ? p : null);
        }}
      />
      {period && statement.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {statement.data && <StatementTable data={statement.data} />}
      {period && statement.data && (
        <StatementActions unitId={unitId} accountId={accountId} period={period} />
      )}
    </section>
  );
}
