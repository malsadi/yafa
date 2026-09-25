/**
 * How a setting's value is entered on screen: one of fixed choices, several
 * of them, yes or no, a whole number, or a set of standard roles. Read from
 * the setting's registered schema, or declared at registration when the
 * schema alone can't say (a list of role ids). Anything else can't be
 * entered on screen, and says so.
 */
export type SettingInput =
  | { kind: 'choice'; options: string[] }
  | { kind: 'multi-choice'; options: string[] }
  | { kind: 'yes-no' }
  | { kind: 'whole-number' }
  | { kind: 'roles' }
  | { kind: 'other' };
