import type { VenueRecord } from '../../../shared/resources-library/venue';
import type { useVenues } from './use-venues';
import { draftOf } from './venue-draft';
import { VenueForm } from './venue-form';

/** Brief 16 B1: change a venue's details, from the version read (9.1). */
export function VenueEdit(props: {
  venue: VenueRecord;
  save: ReturnType<typeof useVenues>['save'];
  onDone: () => void;
}) {
  const { venue, save, onDone } = props;
  return (
    <VenueForm
      initial={draftOf(venue)}
      busy={save.isPending}
      error={save.error}
      onCancel={onDone}
      onSave={(details) => {
        save.mutate(
          { venueId: venue.id, version: venue.version, venue: details },
          { onSuccess: onDone },
        );
      }}
    />
  );
}
