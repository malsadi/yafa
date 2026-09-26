import { useState } from 'react';
import type { AlertChoicesView } from '../../../shared/communication-hub/alert-choices';
import type { SwitchableAlertType } from '../../../shared/communication-hub/alert-types';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { AlertTypeCheckboxes } from './alert-type-checkboxes';
import { ALERT_CHOICES_PATH } from './use-alert-settings';
import { useHubAction } from './use-hub-action';

/** Brief 20 C2 and D-163: which alerts the officer receives — the starting ones until they choose. */
export function AlertChoicesForm(props: { view: AlertChoicesView }) {
  const t = useText().services['communication-hub'];
  const save = useHubAction();
  const [chosen, setChosen] = useState<SwitchableAlertType[]>(props.view.alertTypes ?? []);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate({ path: ALERT_CHOICES_PATH, method: 'PUT', body: { alertTypes: chosen } });
      }}
    >
      {!props.view.chosen && (
        <p className="text-sm">
          {props.view.alertTypes ? t.alertSettings.startingNote : t.alertSettings.notSet}
        </p>
      )}
      <AlertTypeCheckboxes chosen={chosen} onChange={setChosen} />
      <ErrorAlert error={save.error} refusals={t.refusals} />
      {save.isSuccess && (
        <p role="status" className="text-sm">
          {t.alertSettings.saved}
        </p>
      )}
      <button
        type="submit"
        disabled={save.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {t.alertSettings.save}
      </button>
    </form>
  );
}
