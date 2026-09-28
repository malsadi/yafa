/** Brief 23 B4: where a letter received stands (D-214, O-144). */
export const LETTER_IN_STATUSES = [
  'Received',
  'Awaiting reply',
  'Replied',
  'No reply needed',
] as const;

export type LetterInStatus = (typeof LETTER_IN_STATUSES)[number];

export const LetterInStatus = {
  Received: 'Received',
  AwaitingReply: 'Awaiting reply',
  Replied: 'Replied',
  NoReplyNeeded: 'No reply needed',
} as const satisfies Record<string, LetterInStatus>;

/**
 * D-214 (O-144): the moves an officer makes by hand. Replied is set only by
 * generating a reply, in the same batch; it is final.
 */
export const LETTER_IN_MOVES: Readonly<Record<LetterInStatus, readonly LetterInStatus[]>> = {
  Received: ['Awaiting reply', 'No reply needed'],
  'Awaiting reply': ['No reply needed'],
  'No reply needed': ['Awaiting reply'],
  Replied: [],
};

/** A letter in that a letter out can answer: never one marked No reply needed. */
export const ANSWERABLE_STATUSES: readonly LetterInStatus[] = [
  'Received',
  'Awaiting reply',
  'Replied',
];

/** O-145: the handling officer changes only while the letter is still open. */
export const OPEN_STATUSES: readonly LetterInStatus[] = ['Received', 'Awaiting reply'];
