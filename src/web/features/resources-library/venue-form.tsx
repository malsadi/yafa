import { useState } from 'react';
import type { VenueDetails } from '../../../shared/resources-library/venue';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { EditFormButtons } from './edit-form-buttons';
import { detailsOf, type VenueDraft } from './venue-draft';
import { VenueFields } from './venue-fields';

interface VenueFormProps {
  initial: VenueDraft;
  busy: boolean;
  error: Error | null;
  onSave: (venue: VenueDetails) => void;
  onCancel: () => void;
}

/** Brief 16 B1 and D-105: write a venue's details; the cost is written in pounds. */
export function VenueForm(props: VenueFormProps) {
  const t = useText().services['resources-library'].venues;
  const [draft, setDraft] = useState(props.initial);
  const [costInvalid, setCostInvalid] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const details = detailsOf(draft);
        setCostInvalid(details === null);
        if (details) props.onSave(details);
      }}
    >
      <ErrorAlert error={props.error} refusals={t.refusals} />
      {costInvalid && (
        <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
          {t.costInvalid}
        </p>
      )}
      <VenueFields draft={draft} onChange={setDraft} />
      <EditFormButtons labels={t} busy={props.busy} onCancel={props.onCancel} />
    </form>
  );
}
