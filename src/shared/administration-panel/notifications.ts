import type { AlertType } from '../communication-hub/alert-types';
import type { AdminText } from './admin-texts';

/** Brief 25 C4: the alert types new officers start with, and the iPhone install guide. */
export interface NotificationsView {
  /** Null while not set (rule 5); national circulars are always on and not part of it. */
  alertTypesForNewOfficers: AlertType[] | null;
  installGuide: AdminText | null;
}
