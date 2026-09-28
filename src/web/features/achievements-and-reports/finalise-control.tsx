import { useState } from 'react';
import type { AnnualReportRecord } from '../../../shared/achievements-and-reports/annual-report';
import { useText } from '../../app/language/use-text';
import { FinaliseDialog } from './finalise-dialog';

/** O-158: "Finalise and lock", which asks first. */
export function FinaliseControl({ report }: { report: AnnualReportRecord }) {
  const t = useText().services['achievements-and-reports'].reports;
  const [asking, setAsking] = useState(false);
  if (asking)
    return (
      <FinaliseDialog
        report={report}
        onCancel={() => {
          setAsking(false);
        }}
      />
    );
  return (
    <button
      type="button"
      className="self-start rounded bg-slate-900 px-3 py-2 text-white"
      onClick={() => {
        setAsking(true);
      }}
    >
      {t.finalise}
    </button>
  );
}
