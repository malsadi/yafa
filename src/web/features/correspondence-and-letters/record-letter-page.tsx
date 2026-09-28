import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { RecordLetterForm } from './record-letter-form';
import { useLetterUnit, useRecordingChoices } from './use-letter-queries';

/** Brief 23 B3: record a letter the unit has received. */
export function RecordLetterPage() {
  const unitId = useLetterUnit();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const choices = useRecordingChoices(unitId);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.record.heading}</h2>
      <ErrorAlert error={choices.error} refusals={t.refusals} />
      {choices.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {choices.data && <RecordLetterForm unitId={unitId} choices={choices.data} />}
    </section>
  );
}
