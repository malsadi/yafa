import type {
  LetterInDetail,
  LetterInSummary,
  LetterOutDetail,
  LetterOutSummary,
  RecordingChoices,
  WritingChoices,
} from '../../../shared/correspondence-and-letters/letter-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/correspondence-and-letters/units/${unitId}`;
export const letterOutPath = (unitId: string, id: string) =>
  `${unitPath(unitId)}/letters-out/${id}`;
export const letterInPath = (unitId: string, id: string) => `${unitPath(unitId)}/letters-in/${id}`;

export const fetchLettersOut = (request: Request, unitId: string) =>
  request<LetterOutSummary[]>(`${unitPath(unitId)}/letters-out`);
export const fetchLetterOut = (request: Request, unitId: string, id: string) =>
  request<LetterOutDetail>(letterOutPath(unitId, id));
export const fetchLettersIn = (request: Request, unitId: string) =>
  request<LetterInSummary[]>(`${unitPath(unitId)}/letters-in`);
export const fetchLetterIn = (request: Request, unitId: string, id: string) =>
  request<LetterInDetail>(letterInPath(unitId, id));
export const fetchWritingChoices = (request: Request, unitId: string) =>
  request<WritingChoices>(`${unitPath(unitId)}/writing-choices`);
export const fetchRecordingChoices = (request: Request, unitId: string) =>
  request<RecordingChoices>(`${unitPath(unitId)}/recording-choices`);

/** Every Correspondence query starts with this, so one change refreshes them all. */
export const LETTERS_KEY = ['correspondence-and-letters'] as const;
