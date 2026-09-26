import { useState } from 'react';
import type { NoticeRecord } from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { NoticeForm } from './notice-form';
import { NoticeHeading } from './notice-heading';
import { NoticeRetireButton } from './notice-retire-button';
import { NoticeVotePanel } from './notice-vote-panel';
import { VoteClosingExtender } from './vote-closing-extender';

/** Brief 20 A1 and A2; D-155: one notice, its vote, and — for those who manage — changing and retiring it. */
export function NoticeItem(props: { notice: NoticeRecord; manages: boolean }) {
  const t = useText().services['communication-hub'].noticeboard;
  const [editing, setEditing] = useState(false);
  const { notice } = props;
  if (editing)
    return (
      <li>
        <NoticeForm
          unitId={notice.unitId}
          notice={notice}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  const officerNotice = notice.source === 'officer';
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <NoticeHeading notice={notice} />
      {notice.retiredAt && <span className="text-sm font-medium">{t.retired}</span>}
      {notice.body && <p className="whitespace-pre-line">{notice.body}</p>}
      {notice.vote && <NoticeVotePanel notice={notice} vote={notice.vote} />}
      {props.manages && (
        <div className="flex flex-wrap gap-2">
          {officerNotice && !notice.retiredAt && (
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              onClick={() => {
                setEditing(true);
              }}
            >
              {t.edit}
            </button>
          )}
          {notice.vote && !notice.vote.closed && !notice.retiredAt && (
            <VoteClosingExtender notice={notice} />
          )}
          <NoticeRetireButton notice={notice} />
        </div>
      )}
    </li>
  );
}
