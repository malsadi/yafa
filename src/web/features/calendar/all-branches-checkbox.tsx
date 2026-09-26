import { useText } from '../../app/language/use-text';

/** D-146: whether a General Council date shows in every branch's calendar. */
export function AllBranchesCheckbox(props: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const t = useText().services.calendar;
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(event) => {
          props.onChange(event.target.checked);
        }}
      />
      {t.form.forAllBranches}
    </label>
  );
}
