import { useState } from 'react';
import type {
  NoticeRecord,
  NoticeVoteView,
} from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { unitHubPath } from './hub.api';
import { useHubAction } from './use-hub-action';

/** Brief 20 A2 and D-156: an eligible voter picks one option, once (P12). */
export function NoticeBallotForm(props: { notice: NoticeRecord; vote: NoticeVoteView }) {
  const t = useText().services['communication-hub'];
  const cast = useHubAction();
  const [optionId, setOptionId] = useState('');
  const path = `${unitHubPath(props.notice.unitId)}/notices/${props.notice.id}/ballot`;
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        cast.mutate({ path, method: 'POST', body: { optionId } });
      }}
    >
      <fieldset className="flex flex-col gap-1">
        <legend className="sr-only">{props.vote.question}</legend>
        {props.vote.options.map((option) => (
          <label key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              name={`vote-${props.notice.id}`}
              required
              checked={optionId === option.id}
              onChange={() => {
                setOptionId(option.id);
              }}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <ErrorAlert error={cast.error} refusals={t.refusals} />
      <button
        type="submit"
        disabled={cast.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {t.vote.cast}
      </button>
    </form>
  );
}
