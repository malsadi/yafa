/** Brief 22 A2: officers chosen from the unit's officers list, one checkbox each. */
export function OfficerCheckboxes(props: {
  legend: string;
  officers: { personId: string; name: string }[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="font-semibold">{props.legend}</legend>
      {props.officers.map((o) => (
        <label key={o.personId} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.chosen.includes(o.personId)}
            onChange={(e) => {
              props.onChange(
                e.target.checked
                  ? [...props.chosen, o.personId]
                  : props.chosen.filter((id) => id !== o.personId),
              );
            }}
          />
          {o.name}
        </label>
      ))}
    </fieldset>
  );
}
