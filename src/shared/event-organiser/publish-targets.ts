/** Brief 21 B4, D-182 and D-186: the two places an event is published to, each once. */
export const PublishTarget = { Calendar: 'calendar', Noticeboard: 'noticeboard' } as const;

export type PublishTarget = (typeof PublishTarget)[keyof typeof PublishTarget];

export const PUBLISH_TARGETS: readonly PublishTarget[] = Object.values(PublishTarget);
