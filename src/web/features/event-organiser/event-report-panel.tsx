import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { ReportBudgetTable } from './report-budget-table';
import { useEventReport } from './use-event-queries';

/**
 * Brief 21 C1 and D-183: the post-event report on screen, from Completed —
 * the tasks done against the total, each with its status, and the budget
 * against actual. A cancelled event's is headed as cancelled (D-181).
 */
export function EventReportPanel({ event }: { event: EventSummary }) {
  const text = useText();
  const t = text.services['event-organiser'].reportPdf;
  const statuses = text.services['task-tracker'].statuses;
  const report = useEventReport(event.unitId, event.id, true);
  if (!report.data) return null;
  const { tasks, budget, cancelled } = report.data;
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">
        {fillText(cancelled ? t.titleCancelled : t.title, { name: event.name })}
      </h3>
      <h4 className="text-sm font-semibold">{t.tasksHeading}</h4>
      <p className="text-sm">
        {fillText(t.tasksSummary, { done: String(tasks.done), total: String(tasks.total) })}
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {tasks.items.map((item, index) => (
          <li
            key={`${String(index)}-${item.title}`}
          >{`${item.title} — ${statuses[item.status]}`}</li>
        ))}
      </ul>
      <h4 className="text-sm font-semibold">{t.budgetHeading}</h4>
      <ReportBudgetTable budget={budget} />
    </section>
  );
}
