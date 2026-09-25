import { z } from 'zod';
import type { SettingInput } from '../../../shared/administration-panel/setting-input';

/** How a setting is entered on screen, from the shape of its registered schema. */
export function describeSettingInput(schema: z.ZodType): SettingInput {
  if (schema instanceof z.ZodEnum) return { kind: 'choice', options: schema.options.map(String) };
  if (schema instanceof z.ZodBoolean) return { kind: 'yes-no' };
  if (schema instanceof z.ZodNumber && schema.format === 'safeint') return { kind: 'whole-number' };
  return { kind: 'other' };
}
