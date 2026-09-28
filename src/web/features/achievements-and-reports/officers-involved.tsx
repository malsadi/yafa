import { useText } from '../../app/language/use-text';
import { toggled } from './achievement-draft';

/** O-151: the officers involved — anyone who has served in the unit, past officers included. */
export function OfficersInvolved(props: {
  people: { personId: string; name: string }[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}) {
  const t = useText().services['achievements-and-reports'].form;
  return (
    <fieldset className="flex flex-col gap-1">
      <legend>{t.officers}</legend>
      <p className="text-sm text-slate-600">{t.officersHint}</p>
      {props.people.map((p) => (
        <label key={p.personId} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.chosen.includes(p.personId)}
            onChange={(e) => {
              props.onChange(toggled(props.chosen, p.personId, e.target.checked));
            }}
          />
          {p.name}
        </label>
      ))}
    </fieldset>
  );
}
