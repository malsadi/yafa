import type { EquipmentView } from '../../../shared/resources-library/equipment';
import { useNamedOptions } from '../../app/language/use-named-options';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { fillText } from '../../text/fill-text';

/** 15 B3 and D-114: an optional condition from the list — or, while the list is empty, a note saying so. */
export function EquipmentConditionField(props: {
  conditions: EquipmentView['conditions'];
  value: string;
  onChange: (conditionId: string) => void;
}) {
  const t = useText().services['resources-library'].equipment;
  const named = useNamedOptions();
  if (props.conditions.length === 0)
    return <p className="text-sm text-slate-600">{t.noConditions}</p>;
  return (
    <SelectField
      label={fillText(t.optional, { label: t.condition })}
      value={props.value}
      onChange={props.onChange}
      options={named(props.conditions)}
      emptyLabel=""
      optional
    />
  );
}
