/**
 * How a setting's value is entered on screen: one of fixed choices, several
 * of them, yes or no, a whole number, an amount of money, a day and month,
 * or a set of standard roles. Read from
 * the setting's registered schema, or declared at registration when the
 * schema alone can't say (a list of role ids). Anything else can't be
 * entered on screen, and says so.
 */
export type SettingInput =
  | { kind: 'choice'; options: string[] }
  | { kind: 'multi-choice'; options: string[] }
  | { kind: 'yes-no' }
  | { kind: 'whole-number' }
  /** An amount in integer pence (9.1), entered and shown in pounds. */
  | { kind: 'money' }
  /** A day of a month, such as 1 April, stored as `{ month, day }`. */
  | { kind: 'day-and-month' }
  | { kind: 'roles' }
  /** Entered on the Branding and letterhead screen (25 C3), not in a plain field. */
  | { kind: 'branding' }
  | { kind: 'other' };
