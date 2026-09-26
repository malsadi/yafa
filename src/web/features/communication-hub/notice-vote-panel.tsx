import type {
  NoticeRecord,
  NoticeVoteView,
} from '../../../shared/communication-hub/notice-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { NoticeBallotForm } from './notice-ballot-form';
import { NoticeVoteResults } from './notice-vote-results';

/** Brief 20 A2, P12 and D-156: the question, when voting closes, voting, and — once closed — the counts. */
export function NoticeVotePanel(props: { notice: NoticeRecord; vote: NoticeVoteView }) {
  const t = useText().services['communication-hub'].vote;
  const formatDate = useFormatDate();
  const { vote } = props;
  const mine = vote.options.find((o) => o.id === vote.myOptionId);
  return (
    <div className="flex flex-col gap-2 rounded bg-slate-50 p-3">
      <p className="font-medium">{vote.question}</p>
      <p className="text-sm">
        {fillText(vote.closed ? t.closed : t.closesOn, { date: formatDate(vote.closesOn) })}
      </p>
      {mine && <p className="text-sm">{fillText(t.youVoted, { option: mine.label })}</p>}
      {vote.mayVote && <NoticeBallotForm notice={props.notice} vote={vote} />}
      {!vote.closed && !mine && !vote.mayVote && <p className="text-sm">{t.notEligible}</p>}
      {vote.results ? (
        <NoticeVoteResults vote={vote} results={vote.results} />
      ) : (
        <p className="text-sm text-slate-600">{t.resultsLater}</p>
      )}
    </div>
  );
}
