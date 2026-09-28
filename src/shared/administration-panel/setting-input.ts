/**
 * How a setting's value is entered on screen: one of fixed choices, several
 * of them, yes or no, a whole number, an amount of money, a day and month,
 * a set of standard roles, or a letter reference format. Read from
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
  /** A reference number format, typed in and checked as typed (23 B1; D-214). */
  | { kind: 'reference-format' }
  /** Entered on the Branding and letterhead screen (25 C3), not in a plain field. */
  | { kind: 'branding' }
  | { kind: 'other' };
