import { useState } from 'react';
import type { NoticeRecord } from '../../../shared/communication-hub/notice-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';
import { unitHubPath } from './hub.api';
import { useHubAction } from './use-hub-action';

/** D-166: move an open vote's closing date later — never earlier — even after voting has started. */
export function VoteClosingExtender(props: { notice: NoticeRecord }) {
  const t = useText().services['communication-hub'];
  const move = useHubAction();
  const [open, setOpen] = useState(false);
  const [closesOn, setClosesOn] = useState('');
  const path = `${unitHubPath(props.notice.unitId)}/notices/${props.notice.id}/closing-date`;
  if (!open)
    return (
      <button
        type="button"
        className="rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t.vote.extend}
      </button>
    );
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        move.mutate(
          { path, method: 'PUT', body: { closesOn } },
          {
            onSuccess: () => {
              setOpen(false);
            },
          },
        );
      }}
    >
      <ErrorAlert error={move.error} refusals={t.refusals} />
      <TextField label={t.vote.newClosesOn} type="date" value={closesOn} onChange={setClosesOn} />
      <FormButtons
        submit={t.vote.extendSave}
        cancel={t.noticeForm.cancel}
        busy={move.isPending}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </form>
  );
}
