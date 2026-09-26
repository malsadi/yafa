import { unitHubPath } from './hub.api';

export interface CircularDraft {
  title: string;
  body: string;
  to: 'all' | 'chosen';
  unitIds: string[];
}

export const emptyCircularDraft = (): CircularDraft => ({
  title: '',
  body: '',
  to: 'all',
  unitIds: [],
});

/** Brief 20 A3: the request sending makes — to all branches, or to the chosen ones. */
export function sendRequest(unitId: string, draft: CircularDraft) {
  const recipients =
    draft.to === 'all' ? { toAllBranches: true } : { toAllBranches: false, unitIds: draft.unitIds };
  return {
    path: `${unitHubPath(unitId)}/circulars`,
    method: 'POST' as const,
    body: { title: draft.title, body: draft.body, ...recipients },
  };
}
