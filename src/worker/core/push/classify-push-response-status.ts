export type PushDeliveryOutcome = 'delivered' | 'gone' | 'retry';

/**
 * RFC 8030 §7.3: a push service answers 404 or 410 once a subscription no
 * longer exists — both mean "gone," never "try again." Anything else
 * (5xx, 429, a stray 4xx from a proxy) is treated as retryable: the cost of
 * a wrong `retry` is a wasted resend, but the cost of a wrong `gone` is a
 * subscription this portal can never recreate on its own.
 */
export function classifyPushResponseStatus(status: number): PushDeliveryOutcome {
  if (status >= 200 && status < 300) {
    return 'delivered';
  }
  if (status === 404 || status === 410) {
    return 'gone';
  }
  return 'retry';
}
