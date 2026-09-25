import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { SettingValueForm } from '../setting-editor/setting-value-form';

interface RequiredSettingFormProps {
  settingKey: string;
  input: SettingInput;
  label: string;
  busy: boolean;
  onSave: (value: unknown) => void;
}

/** D-074: set a required setting from the set-up checklist. Nothing is preselected. */
export function RequiredSettingForm(props: RequiredSettingFormProps) {
  return <SettingValueForm {...props} value={null} />;
}
