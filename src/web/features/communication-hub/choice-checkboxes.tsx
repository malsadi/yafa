/** A labelled group of checkboxes, each one chosen or not. */
export function ChoiceCheckboxes(props: {
  legend: string;
  choices: readonly { value: string; label: string }[];
  chosen: string[];
  onChange: (chosen: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="font-medium">{props.legend}</legend>
      {props.choices.map((choice) => (
        <label key={choice.value} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={props.chosen.includes(choice.value)}
            onChange={(event) => {
              props.onChange(
                event.target.checked
                  ? [...props.chosen, choice.value]
                  : props.chosen.filter((v) => v !== choice.value),
              );
            }}
          />
          {choice.label}
        </label>
      ))}
    </fieldset>
  );
}
