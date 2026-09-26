import type { NoticeVoteView } from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** D-156: each option's count — never who voted what. */
export function NoticeVoteResults(props: {
  vote: NoticeVoteView;
  results: { optionId: string; count: number }[];
}) {
  const t = useText().services['communication-hub'].vote;
  return (
    <div>
      <p className="font-medium">{t.results}</p>
      <ul className="text-sm">
        {props.vote.options.map((option) => (
          <li key={option.id}>
            {option.label}:{' '}
            {fillText(t.count, {
              count: props.results.find((r) => r.optionId === option.id)?.count ?? 0,
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
