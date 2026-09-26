import type { HubMessage } from '../../../shared/communication-hub/conversation-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { removeMessagePath } from './conversations.api';
import { useHubAction } from './use-hub-action';

/** One message: who wrote it, from where, when — its text, or the mark it was removed (D-161). */
export function HubMessageItem(props: { message: HubMessage }) {
  const t = useText().services['communication-hub'];
  const { language } = useLanguage();
  const formatTimestamp = useFormatTimestamp();
  const remove = useHubAction();
  const m = props.message;
  const units = language === 'ar' ? m.authorUnitsAr : m.authorUnitsEn;
  const date = formatTimestamp(m.sentAt);
  return (
    <li className="flex flex-col gap-1 rounded bg-slate-50 p-2">
      <span className="text-sm text-slate-600">
        {units
          ? fillText(t.conversation.by, { name: m.authorName, units, date })
          : fillText(t.conversation.byName, { name: m.authorName, date })}
      </span>
      {m.removed ? (
        <p className="text-sm italic">{t.conversation.removed}</p>
      ) : (
        <p className="whitespace-pre-line">{m.body}</p>
      )}
      {m.mine && !m.removed && (
        <button
          type="button"
          disabled={remove.isPending}
          className="self-start text-sm underline disabled:opacity-50"
          onClick={() => {
            remove.mutate({ path: removeMessagePath(m.id), method: 'POST', body: {} });
          }}
        >
          {t.conversation.remove}
        </button>
      )}
      <ErrorAlert error={remove.error} refusals={t.refusals} />
    </li>
  );
}
