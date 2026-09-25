import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { scalarText } from './scalar-text';

/** A value as it is being entered: text for one value, a list for several. */
export type SettingDraft = string | string[];

/** The draft for a value already stored, or an empty one while not configured. */
export function toDraft(input: SettingInput, value: unknown): SettingDraft {
  if (input.kind === 'multi-choice' || input.kind === 'roles') {
    return Array.isArray(value) ? value.map(scalarText) : [];
  }
  return value === null || value === undefined ? '' : scalarText(value);
}

/** The value as the setting's schema expects it, from what was entered. */
export function fromDraft(input: SettingInput, draft: SettingDraft): unknown {
  if (Array.isArray(draft)) return draft;
  if (input.kind === 'yes-no') return draft === 'true';
  if (input.kind === 'whole-number') return Number(draft);
  return draft;
}
