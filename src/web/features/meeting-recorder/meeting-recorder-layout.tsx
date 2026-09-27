import { Outlet } from 'react-router';
import { useText } from '../../app/language/use-text';
import { NotFoundPage } from '../../app/pages/not-found-page';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { PageHeading } from '../../components/page-heading';

/** Brief 22: the selected unit's meetings. Switched off for it, the service is hidden (8.4). */
export function MeetingRecorderLayout() {
  const t = useText().services['meeting-recorder'];
  const { unit } = useSelectedUnit();
  if (!unit?.enabledServices.includes('meeting-recorder')) return <NotFoundPage />;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{t.name}</PageHeading>
      <Outlet context={unit.id} />
    </div>
  );
}
