/**
 * Brief 20 C1: the alerts an officer can receive — new notices, votes,
 * circulars, replies and requests. Brief 20 rules: national circulars
 * always notify and cannot be switched off.
 */
export const ALERT_TYPES = ['notices', 'votes', 'circulars', 'replies', 'requests'] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_TYPES_ALWAYS_ON: readonly AlertType[] = ['circulars'];

/** The alert types an officer may switch on or off (brief 20 C2). */
export const SWITCHABLE_ALERT_TYPES = ALERT_TYPES.filter(
  (type) => !ALERT_TYPES_ALWAYS_ON.includes(type),
) as Exclude<AlertType, 'circulars'>[];
