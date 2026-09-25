import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';

/** D-067: open until the first confirmation; complete, and locked, once both have confirmed. */
export type HandoverStatus = 'open' | 'confirming' | 'complete';

export function handoverStatus(handover: HandoverRecord): HandoverStatus {
  const confirmations = [handover.outgoingConfirmedAt, handover.incomingConfirmedAt];
  if (confirmations.every((at) => at !== null)) return 'complete';
  return confirmations.some((at) => at !== null) ? 'confirming' : 'open';
}
