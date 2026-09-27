import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import { ActionButton } from './action-button';
import type { TemplateDraft } from './template-draft';

type Row = TemplateDraft['budgetLines'][number];

/** D-178 and D-131: the default budget lines — a name and an amount in pounds. */
export function TemplateLineRows(props: { rows: Row[]; onChange: (rows: Row[]) => void }) {
  const t = useText().services['event-organiser'].templates;
  const set = (i: number, field: keyof Row) => (value: string) => {
    props.onChange(props.rows.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold">{t.budgetLines}</legend>
      {props.rows.map((row, i) => (
        <div key={String(i)} className="flex flex-wrap items-end gap-2">
          <TextField label={t.lineName} value={row.name} onChange={set(i, 'name')} />
          <TextField label={t.lineAmount} value={row.amount} onChange={set(i, 'amount')} />
          <ActionButton
            label={t.removeRow}
            onClick={() => {
              props.onChange(props.rows.filter((_, j) => j !== i));
            }}
          />
        </div>
      ))}
      <ActionButton
        label={t.addLine}
        onClick={() => {
          props.onChange([...props.rows, { name: '', amount: '' }]);
        }}
      />
    </fieldset>
  );
}
