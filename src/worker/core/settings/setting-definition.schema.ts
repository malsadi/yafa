import { z } from 'zod';
import type { SettingInput } from '../../../shared/administration-panel/setting-input';

// Setting keys are "<service>.<setting_name>" (brief section 5.1).
const SETTING_KEY_PATTERN = /^[a-z][a-z-]*\.[a-z][a-z_]*$/;

export const settingKeySchema = z.string().regex(SETTING_KEY_PATTERN);

export interface SettingDefinition<Value = unknown> {
  key: string;
  label: string;
  description: string;
  schema: z.ZodType<Value>;
  required: boolean;
  unitOverrideAllowed: boolean;
  /** How it is entered on screen, when its schema alone can't say (describeSettingInput). */
  input?: SettingInput;
}
