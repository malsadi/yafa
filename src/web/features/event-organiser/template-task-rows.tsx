import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import { ActionButton } from '../../components/action-button';
import type { TemplateDraft } from './template-draft';

type Row = TemplateDraft['tasks'][number];

/** D-178: the default tasks — a title, an optional description, and how many days before the first day. */
export function TemplateTaskRows(props: { rows: Row[]; onChange: (rows: Row[]) => void }) {
  const t = useText().services['event-organiser'].templates;
  const set = (i: number, field: keyof Row) => (value: string) => {
    props.onChange(props.rows.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold">{t.tasks}</legend>
      {props.rows.map((row, i) => (
        <div key={String(i)} className="flex flex-wrap items-end gap-2">
          <TextField label={t.taskTitle} value={row.title} onChange={set(i, 'title')} />
          <TextField
            label={t.taskDescription}
            optional
            value={row.description}
            onChange={set(i, 'description')}
          />
          <TextField
            label={t.daysBefore}
            type="number"
            value={row.daysBefore}
            onChange={set(i, 'daysBefore')}
          />
          <ActionButton
            label={t.removeRow}
            onClick={() => {
              props.onChange(props.rows.filter((_, j) => j !== i));
            }}
          />
        </div>
      ))}
      <ActionButton
        label={t.addTask}
        onClick={() => {
          props.onChange([...props.rows, { title: '', description: '', daysBefore: '' }]);
        }}
      />
    </fieldset>
  );
}
