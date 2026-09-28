import { useSearchParams } from 'react-router';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { LetterForm } from './letter-form';
import { useLetterUnit, useWritingChoices } from './use-letter-queries';

/** Brief 23 A1, A2: write a letter from a template — or a reply, when opened from the letter it answers. */
export function WriteLetterPage() {
  const unitId = useLetterUnit();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const [search] = useSearchParams();
  const choices = useWritingChoices(unitId);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.write.heading}</h2>
      <ErrorAlert error={choices.error} refusals={t.refusals} />
      {choices.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {choices.data?.templates.length === 0 && <p>{t.write.noTemplates}</p>}
      {choices.data?.signerRoles.length === 0 && <p>{t.write.noRoles}</p>}
      {!!choices.data?.templates.length && !!choices.data.signerRoles.length && (
        <LetterForm unitId={unitId} choices={choices.data} replyTo={search.get('replyTo')} />
      )}
    </section>
  );
}
