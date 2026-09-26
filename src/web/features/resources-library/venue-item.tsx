import { useState } from 'react';
import type { VenueRecord } from '../../../shared/resources-library/venue';
import { useText } from '../../app/language/use-text';
import { ItemBadges } from './item-badges';
import { RetireButton } from './retire-button';
import type { useVenues } from './use-venues';
import { VenueDetailsList } from './venue-details';
import { VenueEdit } from './venue-edit';
import { VenueNotes } from './venue-notes';

interface ItemProps {
  venue: VenueRecord;
  manages: boolean;
  actions: Pick<ReturnType<typeof useVenues>, 'save' | 'addNote' | 'retireNote'>;
  onSetRetired: (retire: boolean) => void;
}

/** Brief 16 B1: one venue — its details and notes; the unit's own can change it. */
export function VenueItem({ venue, manages, actions, onSetRetired }: ItemProps) {
  const t = useText().services['resources-library'].venues;
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li>
        <VenueEdit
          venue={venue}
          save={actions.save}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">{venue.name}</span>
        <ItemBadges national={venue.national} retired={venue.retiredAt !== null} labels={t} />
        {manages && (
          <span className="ms-auto flex gap-2">
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              onClick={() => {
                setEditing(true);
              }}
            >
              {t.edit}
            </button>
            <RetireButton
              retired={venue.retiredAt !== null}
              busy={false}
              labels={t}
              onSetRetired={onSetRetired}
            />
          </span>
        )}
      </div>
      <VenueDetailsList venue={venue} />
      <VenueNotes venue={venue} manages={manages} actions={actions} />
    </li>
  );
}
