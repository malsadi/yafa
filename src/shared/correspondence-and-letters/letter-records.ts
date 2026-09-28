import type { Language } from '../core/languages';
import type { LetterheadUnit, LetterTemplateRecord } from '../resources-library/letter-template';
import type { LetterInStatus } from './letter-in-statuses';

/** Brief 23 B2: a letter out as its register lists it. */
export interface LetterOutSummary {
  id: string;
  referenceNumber: string;
  letterDate: string;
  recipientName: string;
  subject: string;
  /** "Sent by": the officer who generated and signed it. */
  signerName: string | null;
}

/** Brief 23 B3, B4: a letter in as its register lists it. */
export interface LetterInSummary {
  id: string;
  referenceNumber: string;
  dateReceived: string;
  sender: string;
  subject: string;
  handlerPersonId: string;
  handlerName: string | null;
  status: LetterInStatus;
  /** 9.1: sent back with a change, so a stale one is refused. */
  version: number;
}

/** D-214 (O-146): one letter in an exchange, in either direction. */
export interface ExchangeLetter {
  direction: 'out' | 'in';
  id: string;
  referenceNumber: string;
  /** The letter's date (out) or the date it was received (in). */
  date: string;
  /** The recipient (out) or the sender (in). */
  party: string;
  subject: string;
}

export interface LetterOutDetail extends LetterOutSummary {
  recipientAddress: string | null;
  language: Language;
  signerRoleNameEn: string | null;
  signerRoleNameAr: string | null;
  replyToLetterInId: string | null;
  /** Every letter linked to this one, directly or through others, by date (O-146). */
  exchange: ExchangeLetter[];
}

export interface LetterInDetail extends LetterInSummary {
  answersLetterOutId: string | null;
  /** The scan or photo's own name, to save it under. */
  fileName: string;
  exchange: ExchangeLetter[];
}

/** What an officer writing a letter chooses from (23 A1, A2; D-214). */
export interface WritingChoices {
  /** The unit's own and the national templates, retired ones left out (O-141). */
  templates: Pick<
    LetterTemplateRecord,
    'id' | 'national' | 'title' | 'subject' | 'body' | 'fields' | 'language'
  >[];
  /** The writer's own current roles in the unit, to sign with (O-140). */
  signerRoles: { roleId: string; nameEn: string; nameAr: string }[];
  signerName: string;
  letterheadUnit: LetterheadUnit;
  /** Letters in a reply can answer (O-144), the latest first. */
  answerable: Pick<LetterInSummary, 'id' | 'referenceNumber' | 'sender' | 'subject' | 'status'>[];
}

/** What an officer logging a letter in chooses from (23 B3; D-214). */
export interface RecordingChoices {
  /** The unit's current officers, one of whom handles the letter (O-143). */
  officers: { personId: string; name: string }[];
  /** The unit's letters out it may answer (O-146), the latest first. */
  lettersOut: Pick<LetterOutSummary, 'id' | 'referenceNumber' | 'recipientName' | 'subject'>[];
}
