import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';
import { CalendarBoard } from './calendar-board';
import { FeedPanel } from './feed-panel';

/** Brief 19: the selected unit's calendar and the phone link. Switched off for it, the calendar is hidden (8.4). */
export function CalendarPage() {
  const t = useText().services.calendar;
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('calendar')) return <NotFoundPage />;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <CalendarBoard key={unit.id} unit={unit} />
      <FeedPanel />
    </div>
  );
}
