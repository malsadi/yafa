import { useText } from '../../app/language/use-text';
import { AddVenue } from './add-venue';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { useLibraryRetirement } from './use-library-retirement';
import { useLibraryUnit } from './use-library-unit';
import { useVenues, venuesKey } from './use-venues';
import { VenueItem } from './venue-item';
import { venuesPath } from './venues.api';

/** Brief 16 B1 and D-106: the unit's venues and the General Council's. */
export function VenuesPage() {
  const unitId = useLibraryUnit();
  const text = useText();
  const t = text.services['resources-library'].venues;
  const { context } = useActiveSession();
  const { list, create, save, addNote, retireNote } = useVenues(unitId);
  const retirement = useLibraryRetirement(venuesKey(unitId));
  // A hint only (T-042): the portal decides each change itself.
  const mayManage = context.capabilities.includes('resources-library.venues.manage');
  if (list.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (list.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      <ErrorAlert error={retirement.error} refusals={t.refusals} />
      {list.data.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {list.data.map((venue) => (
          <VenueItem
            key={venue.id}
            venue={venue}
            manages={mayManage && venue.unitId === unitId}
            actions={{ save, addNote, retireNote }}
            onSetRetired={(retire) => {
              retirement.mutate({
                itemPath: `${venuesPath(unitId)}/${venue.id}`,
                version: venue.version,
                retire,
              });
            }}
          />
        ))}
      </ul>
      {mayManage && <AddVenue create={create} />}
    </section>
  );
}
