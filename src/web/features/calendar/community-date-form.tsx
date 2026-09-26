import { useState } from 'react';
import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import type { MeUnit } from '../../../shared/core/me-response';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { ClashNotice } from './clash-notice';
import { draftOf, saveRequest } from './community-date-draft';
import { CommunityDateFields } from './community-date-fields';
import { useCalendarAction } from './use-calendar-action';

/** Brief 19 A3 and B4: add a community date, or change one from the version read (9.1), with any clash shown. */
export function CommunityDateForm(props: {
  unit: MeUnit;
  date?: CalendarItem;
  onDone: () => void;
}) {
  const t = useText().services.calendar;
  const save = useCalendarAction();
  const [draft, setDraft] = useState(draftOf(props.date));
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(saveRequest(props.unit.id, draft, props.date), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <CommunityDateFields
        draft={draft}
        onChange={setDraft}
        // A hint (T-042): the portal itself refuses anyone but the General Council (D-146).
        offerAllBranches={props.unit.type === 'national'}
      />
      <ClashNotice
        unitId={props.unit.id}
        date={draft.startDate}
        lastDate={draft.endDate || draft.startDate}
      />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
