import type { TaskOwnerChoice } from '../../../shared/task-tracker/task-records';
import { TASK_STATUSES } from '../../../shared/task-tracker/task-statuses';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';

export interface TaskDraft {
  title: string;
  description: string;
  ownerPersonId: string;
  dueDate: string;
  status: string;
}

/** D-139: title, optional description, owner (a current officer) and due date; the status too when changing. */
export function TaskFormFields(props: {
  draft: TaskDraft;
  onChange: (draft: TaskDraft) => void;
  owners: TaskOwnerChoice[];
  withStatus: boolean;
}) {
  const t = useText().services['task-tracker'];
  const set = (key: keyof TaskDraft) => (value: string) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  return (
    <>
      <TextField label={t.form.title} value={props.draft.title} onChange={set('title')} />
      <TextAreaField
        label={t.form.description}
        value={props.draft.description}
        onChange={set('description')}
      />
      <SelectField
        label={t.form.owner}
        value={props.draft.ownerPersonId}
        onChange={set('ownerPersonId')}
        emptyLabel=""
        options={props.owners.map((o) => ({ value: o.personId, label: o.name }))}
      />
      <TextField
        label={t.form.dueDate}
        type="date"
        value={props.draft.dueDate}
        onChange={set('dueDate')}
      />
      {props.withStatus && (
        <SelectField
          label={t.form.status}
          value={props.draft.status}
          onChange={set('status')}
          options={TASK_STATUSES.map((s) => ({ value: s, label: t.statuses[s] }))}
        />
      )}
    </>
  );
}
