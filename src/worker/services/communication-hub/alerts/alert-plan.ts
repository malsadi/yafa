import type { AlertType } from '../../../../shared/communication-hub/alert-types';

/** An in-portal notification's kind (T-018): a code whose words live in the texts. */
export type HubNotificationKind =
  | 'communication-hub.notice'
  | 'communication-hub.vote'
  | 'communication-hub.vote-result'
  | 'communication-hub.circular'
  | 'communication-hub.request'
  | 'communication-hub.reply';

/** Who is alerted about one event, of which type, with the details its words need. */
export interface AlertPlan {
  recipients: { personId: string; alertType: AlertType; kind: HubNotificationKind }[];
  /** The details shown in the portal — a pair ending En and Ar is shown in the reader's language. */
  params: Record<string, string>;
  /** D-162: the unit a phone alert names; null where there is none (a role network or discussion). */
  unit: { nameEn: string; nameAr: string } | null;
  /** Where the alert opens. */
  url: string;
}
