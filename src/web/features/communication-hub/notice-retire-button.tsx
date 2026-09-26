import type { NoticeRecord } from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { unitHubPath } from './hub.api';
import { useHubAction } from './use-hub-action';

/** D-155: retire a notice (hidden, never deleted), or bring a retired one back. */
export function NoticeRetireButton(props: { notice: NoticeRecord }) {
  const t = useText().services['communication-hub'];
  const action = useHubAction();
  const { notice } = props;
  const retired = notice.retiredAt !== null;
  const path = `${unitHubPath(notice.unitId)}/notices/${notice.id}/${retired ? 'restore' : 'retire'}`;
  return (
    <>
      <button
        type="button"
        disabled={action.isPending}
        className="rounded border border-slate-400 px-3 py-1 disabled:opacity-50"
        onClick={() => {
          action.mutate({ path, method: 'POST', body: { version: notice.version } });
        }}
      >
        {retired ? t.noticeboard.restore : t.noticeboard.retire}
      </button>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </>
  );
}
