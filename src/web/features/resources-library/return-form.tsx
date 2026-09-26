import { useState } from 'react';
import { todayInLondon } from '../../app/language/today-in-london';
import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import { EditFormButtons } from './edit-form-buttons';

/** D-099: the date it came back, which closes the loan. */
export function ReturnForm(props: {
  busy: boolean;
  onSave: (returnedOn: string) => void;
  onCancel: () => void;
}) {
  const t = useText().services['resources-library'].equipment;
  const [returnedOn, setReturnedOn] = useState(todayInLondon());
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(returnedOn);
      }}
    >
      <TextField label={t.returnedOn} type="date" value={returnedOn} onChange={setReturnedOn} />
      <EditFormButtons labels={t} busy={props.busy} onCancel={props.onCancel} />
    </form>
  );
}
