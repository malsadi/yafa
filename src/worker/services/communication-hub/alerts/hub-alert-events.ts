import type { AlertType } from '../../../../shared/communication-hub/alert-types';

/**
 * Brief 20 C1 and 10.1: what happened — a new notice (perhaps with a vote),
 * a vote's result, a circular, a request, a new discussion (D-169), or a
 * reply in a conversation.
 * The author, if any, is never alerted about their own post.
 */
export type HubAlertEvent =
  | { kind: 'notice'; unitId: string; noticeId: string; authorPersonId: string }
  | { kind: 'vote-result'; unitId: string; noticeId: string }
  | { kind: 'circular'; circularId: string }
  | { kind: 'request'; requestId: string; authorPersonId: string }
  | { kind: 'discussion'; discussionId: string; authorPersonId: string }
  | {
      kind: 'reply';
      conversation: 'role-network' | 'discussion' | 'request';
      conversationId: string;
      authorPersonId: string;
    };

/** The Queue's messages: an event to fan out, then one phone alert per device. */
export type NotificationsQueueMessage =
  | { type: 'alert'; eventId: string; event: HubAlertEvent }
  | {
      type: 'push';
      subscriptionId: string;
      personId: string;
      alertType: AlertType;
      payload: PushPayload;
    };

/** D-162: a phone alert shows only its kind and the unit, in both languages; the device picks (D-026). */
export interface PushPayload {
  language: 'en' | 'ar' | null;
  en: { title: string; body: string };
  ar: { title: string; body: string };
  url: string;
}

/** One person to alert: of which type, with the in-portal notification and the phone alert's words. */
export interface AlertRecipient {
  personId: string;
  alertType: AlertType;
}

export type NotificationsQueue = Queue<NotificationsQueueMessage>;
