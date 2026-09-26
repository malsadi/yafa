import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { TextAreaField } from '../../components/text-area-field';
import type { useVenues } from './use-venues';

/** D-098: add a note from past use; it is dated and shows who wrote it. */
export function AddVenueNoteForm(props: {
  venueId: string;
  addNote: ReturnType<typeof useVenues>['addNote'];
}) {
  const t = useText().services['resources-library'].venues;
  const [text, setText] = useState('');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.addNote.mutate(
          { venueId: props.venueId, text },
          {
            onSuccess: () => {
              setText('');
            },
          },
        );
      }}
    >
      <TextAreaField label={t.newNote} value={text} onChange={setText} />
      <button
        type="submit"
        disabled={text.trim() === '' || props.addNote.isPending}
        className="self-start rounded border border-slate-400 px-3 py-1"
      >
        {t.addNote}
      </button>
    </form>
  );
}
