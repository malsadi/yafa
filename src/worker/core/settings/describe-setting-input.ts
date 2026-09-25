import { z } from 'zod';
import type { SettingInput } from '../../../shared/administration-panel/setting-input';
import type { SettingDefinition } from './setting-definition.schema';

function fromSchema(schema: z.ZodType): SettingInput {
  if (schema instanceof z.ZodEnum) return { kind: 'choice', options: schema.options.map(String) };
  if (schema instanceof z.ZodArray && schema.element instanceof z.ZodEnum) {
    return { kind: 'multi-choice', options: schema.element.options.map(String) };
  }
  if (schema instanceof z.ZodBoolean) return { kind: 'yes-no' };
  if (schema instanceof z.ZodNumber && schema.format === 'safeint') return { kind: 'whole-number' };
  return { kind: 'other' };
}

/** How a setting is entered on screen: as declared at registration, else from its schema. */
export function describeSettingInput(
  definition: Pick<SettingDefinition, 'schema' | 'input'>,
): SettingInput {
  return definition.input ?? fromSchema(definition.schema);
}
