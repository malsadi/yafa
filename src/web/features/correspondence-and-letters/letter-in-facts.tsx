import type { LetterInDetail } from '../../../shared/correspondence-and-letters/letter-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';

/** Brief 23 B3, B4: a letter in's register entry. */
export function LetterInFacts({ letter }: { letter: LetterInDetail }) {
  const t = useText().services['correspondence-and-letters'];
  const date = useFormatDate();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <dt>{t.lettersIn.dateReceived}</dt>
      <dd>{date(letter.dateReceived)}</dd>
      <dt>{t.lettersIn.sender}</dt>
      <dd>{letter.sender}</dd>
      <dt>{t.lettersIn.subject}</dt>
      <dd>{letter.subject}</dd>
      <dt>{t.lettersIn.handler}</dt>
      <dd>{letter.handlerName ?? ''}</dd>
      <dt>{t.lettersIn.status}</dt>
      <dd>{t.statuses[letter.status]}</dd>
    </dl>
  );
}
