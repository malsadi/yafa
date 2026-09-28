import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/correspondence-and-letters/units/:unitId';
const OUT = `${UNIT}/letters-out`;
const IN = `${UNIT}/letters-in`;
const READ = {
  kind: 'capability',
  capability: 'correspondence-and-letters.registers.read',
} as const;
const WRITE = {
  kind: 'capability',
  capability: 'correspondence-and-letters.letters-out.write',
} as const;
const RECORD = {
  kind: 'capability',
  capability: 'correspondence-and-letters.letters-in.record',
} as const;
// D-214 (O-135): a letter in's handling officer sees it and moves its status
// with no capability; checked in the service.
const READER_OR_HANDLER = { kind: 'signed-in-only' } as const;

/** Brief 7.4: Correspondence and letters' signed-in routes, in the order the app registers them. */
export const CORRESPONDENCE_AND_LETTERS_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/writing-choices`, access: WRITE },
  { method: 'POST', path: `${OUT}/preview-pdf`, access: WRITE },
  { method: 'POST', path: OUT, access: WRITE },
  { method: 'GET', path: OUT, access: READ },
  { method: 'GET', path: `${OUT}/:letterId`, access: READ },
  { method: 'GET', path: `${OUT}/:letterId/file`, access: READ },
  { method: 'GET', path: `${UNIT}/recording-choices`, access: RECORD },
  { method: 'POST', path: `${IN}/uploads`, access: RECORD },
  { method: 'GET', path: IN, access: READ },
  { method: 'PUT', path: `${IN}/:letterId`, access: RECORD },
  { method: 'GET', path: `${IN}/:letterId`, access: READER_OR_HANDLER },
  { method: 'GET', path: `${IN}/:letterId/file`, access: READER_OR_HANDLER },
  { method: 'PUT', path: `${IN}/:letterId/status`, access: READER_OR_HANDLER },
  { method: 'PUT', path: `${IN}/:letterId/handler`, access: RECORD },
];
