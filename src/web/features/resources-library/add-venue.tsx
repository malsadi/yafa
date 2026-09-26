import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import type { useVenues } from './use-venues';
import { EMPTY_VENUE } from './venue-draft';
import { VenueForm } from './venue-form';

/** Brief 16 B1 and D-105: record a venue, perhaps before all its details are known. */
export function AddVenue({ create }: { create: ReturnType<typeof useVenues>['create'] }) {
  const t = useText().services['resources-library'].venues;
  const [adding, setAdding] = useState(false);
  const done = () => {
    setAdding(false);
  };
  if (!adding) {
    return (
      <button
        type="button"
        className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        onClick={() => {
          setAdding(true);
        }}
      >
        {t.add}
      </button>
    );
  }
  return (
    <VenueForm
      initial={EMPTY_VENUE}
      busy={create.isPending}
      error={create.error}
      onCancel={done}
      onSave={(venue) => {
        create.mutate(venue, { onSuccess: done });
      }}
    />
  );
}
