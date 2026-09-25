/**
 * How a setting's value is entered on screen, read from its registered
 * schema: one of fixed choices, yes or no, or a whole number. A setting of
 * any other shape waits for the Service settings screen (25 C1, Phase 2).
 */
export type SettingInput =
  | { kind: 'choice'; options: string[] }
  | { kind: 'yes-no' }
  | { kind: 'whole-number' }
  | { kind: 'other' };
