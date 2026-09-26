/** A labelled row of buttons, one of them chosen: the view, or the scope. */
export function CalendarChoiceGroup<T extends string>(props: {
  label: string;
  choices: readonly { value: T; label: string }[];
  chosen: T;
  onChoose: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={props.label} className="flex gap-1">
      {props.choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          aria-pressed={props.chosen === choice.value}
          className="rounded border border-slate-400 px-3 py-1 aria-pressed:bg-slate-200"
          onClick={() => {
            props.onChoose(choice.value);
          }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
