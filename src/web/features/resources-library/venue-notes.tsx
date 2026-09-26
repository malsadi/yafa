import type { VenueRecord } from '../../../shared/resources-library/venue';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { AddVenueNoteForm } from './add-venue-note-form';
import type { useVenues } from './use-venues';
import { VenueNoteItem } from './venue-note-item';

type Actions = Pick<ReturnType<typeof useVenues>, 'addNote' | 'setNoteRetired'>;

/** D-098, D-107 and D-114: a venue's dated notes; its managers add, retire and bring back. */
export function VenueNotes({
  venue,
  manages,
  actions,
}: {
  venue: VenueRecord;
  manages: boolean;
  actions: Actions;
}) {
  const t = useText().services['resources-library'].venues;
  return (
    <section className="flex flex-col gap-2">
      <h4 className="font-medium">{t.notes}</h4>
      <ErrorAlert
        error={actions.addNote.error ?? actions.setNoteRetired.error}
        refusals={t.refusals}
      />
      {venue.notes.length === 0 && <p className="text-sm">{t.noNotes}</p>}
      <ul className="flex flex-col gap-2">
        {venue.notes.map((note) => (
          <VenueNoteItem
            key={note.id}
            note={note}
            onSetRetired={
              manages
                ? (retire) => {
                    actions.setNoteRetired.mutate({ venueId: venue.id, noteId: note.id, retire });
                  }
                : null
            }
          />
        ))}
      </ul>
      {manages && <AddVenueNoteForm venueId={venue.id} addNote={actions.addNote} />}
    </section>
  );
}
