import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { SelectField } from '../../components/select-field';
import { CloseBalance } from './close-balance';
import { eventPath } from './event-organiser.api';
import { useEventHints } from './event-hints';
import { useEventAction } from './use-event-action';
import { useClosePreview } from './use-event-queries';

/**
 * Brief 21 C2, P16 and D-184, D-131: closing — the officer chooses which
 * branch account receives the balance, warned clearly of an overspend;
 * the report and files are filed to the archive and the event is locked.
 */
export function CloseEventPanel({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'];
  const { language } = useLanguage();
  const hints = useEventHints(event);
  const preview = useClosePreview(event.unitId, event.id, hints.closes);
  const close = useEventAction();
  const [accountId, setAccountId] = useState('');
  if (!hints.closes || !preview.data) return null;
  const { balancePence, branchAccounts } = preview.data;
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        close.mutate({
          path: `${eventPath(event.unitId, event.id)}/close`,
          method: 'POST',
          body: { branchAccountId: accountId, language, version: event.version },
        });
      }}
    >
      <h3 className="font-semibold">{t.close.heading}</h3>
      <CloseBalance balancePence={balancePence} />
      <p className="text-sm">{t.close.explain}</p>
      <ErrorAlert error={close.error} refusals={t.refusals} />
      <SelectField
        label={t.close.account}
        value={accountId}
        emptyLabel=""
        options={branchAccounts.map((a) => ({ value: a.id, label: a.name }))}
        onChange={setAccountId}
      />
      <button
        type="submit"
        className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        disabled={close.isPending}
      >
        {t.close.confirm}
      </button>
    </form>
  );
}
