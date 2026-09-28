import type { ImportReport as Report } from '../../../../shared/administration-panel/data-import';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** Brief 25 D4: the problems to fix first, or what the import will add and leave alone. */
export function ImportReport({ report }: { report: Report }) {
  const t = useText().services['administration-panel'].operations.dataImport;
  if (report.errors.length)
    return (
      <section role="alert" className="flex flex-col gap-1">
        <h2 className="font-semibold">{t.problems}</h2>
        <ul className="list-disc ps-6 text-sm">
          {report.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    );
  const line = (template: string, part: { added: string[] | number; present: string[] | number }) =>
    fillText(template, {
      added: Array.isArray(part.added) ? part.added.length : part.added,
      present: Array.isArray(part.present) ? part.present.length : part.present,
    });
  return (
    <section className="flex flex-col gap-1 text-sm">
      <h2 className="font-semibold">{t.ready}</h2>
      <p>{line(t.unitsLine, report.units)}</p>
      <p>{line(t.peopleLine, report.people)}</p>
      <p>{line(t.termsLine, report.terms)}</p>
      <p>{line(t.accountsLine, report.accounts)}</p>
    </section>
  );
}
