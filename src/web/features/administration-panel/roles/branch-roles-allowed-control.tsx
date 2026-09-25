import { useText } from '../../../app/language/use-text';
import { useBranchRolesAllowed } from './use-branch-roles-allowed';

/**
 * Brief 25 B2 and D-073: whether branches may add roles of their own, set
 * by the national register officer. Until set, it says so and nothing is
 * chosen (rule 5): adding a branch role waits.
 */
export function BranchRolesAllowedControl() {
  const t = useText().services['administration-panel'].roles;
  const { allowed, change } = useBranchRolesAllowed();
  const value = allowed.data?.allowed;
  return (
    <fieldset className="flex flex-col gap-2" disabled={allowed.isPending || change.isPending}>
      <legend className="font-semibold">{t.branchRolesAllowed}</legend>
      {value === null && <p className="text-sm text-slate-600">{t.branchRolesNotSet}</p>}
      {[true, false].map((option) => (
        <label key={String(option)} className="flex items-center gap-2">
          <input
            type="radio"
            name="branch-roles-allowed"
            checked={value === option}
            onChange={() => {
              change.mutate(option);
            }}
          />
          {option ? t.branchRolesYes : t.branchRolesNo}
        </label>
      ))}
    </fieldset>
  );
}
