import type { AnnualReportContent } from '../../../shared/achievements-and-reports/annual-report';
import { annualReportDocument } from '../../../pdf-templates/annual-report/write-annual-report';
import { useLanguage } from '../../app/language/use-language';

/** Brief 24 B2: the report's sections on screen, in the reader's language — the same lines as its PDF. */
export function ReportSections({ content }: { content: AnnualReportContent }) {
  const { language } = useLanguage();
  const written = annualReportDocument(content, { language, organisationName: '' });
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600">{written.details.join(' ')}</p>
      {written.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-1">
          <h3 className="font-semibold">{s.heading}</h3>
          <ul className="list-disc ps-6 text-sm">
            {s.lines.map((line, i) => (
              <li key={i} className="whitespace-pre-line">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
