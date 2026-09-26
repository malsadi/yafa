import type { SettingInput } from '../../../../shared/administration-panel/setting-input';
import { parsePoundsToPence, penceToPoundsText } from '../../../../shared/core/parse-pounds';
import { scalarText } from './scalar-text';

/** A value as it is being entered: text for one value, a list for several. */
export type SettingDraft = string | string[];

/** The draft for a value already stored, or an empty one while not configured. */
export function toDraft(input: SettingInput, value: unknown): SettingDraft {
  if (input.kind === 'multi-choice' || input.kind === 'roles') {
    return Array.isArray(value) ? value.map(scalarText) : [];
  }
  if (value === null || value === undefined) return '';
  if (input.kind === 'money' && typeof value === 'number') return penceToPoundsText(value);
  if (input.kind === 'day-and-month' && typeof value === 'object') {
    const { month, day } = value as { month: number; day: number };
    return `${String(month)}-${String(day)}`;
  }
  return scalarText(value);
}

/** The value as the setting's schema expects it, from what was entered. */
export function fromDraft(input: SettingInput, draft: SettingDraft): unknown {
  if (Array.isArray(draft)) return draft;
  if (input.kind === 'yes-no') return draft === 'true';
  if (input.kind === 'whole-number') return Number(draft);
  // An amount that can't be read as pounds is left for the setting's schema to refuse.
  if (input.kind === 'money') return parsePoundsToPence(draft) ?? draft;
  if (input.kind === 'day-and-month') {
    const [month, day] = draft.split('-').map(Number);
    return { month, day };
  }
  return draft;
}
