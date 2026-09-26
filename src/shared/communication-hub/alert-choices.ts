import type { SwitchableAlertType } from './alert-types';

/** Brief 20 C2: the officer's alerts, and whether they are their own choice or the starting ones (D-163). */
export interface AlertChoicesView {
  /** Null while nothing is chosen and the administrator hasn't set the starting alerts. */
  alertTypes: SwitchableAlertType[] | null;
  chosen: boolean;
}
