import type { RecipientChoice } from './branch-recipient-fields';
import { unitHubPath } from './hub.api';

export interface RequestDraft extends RecipientChoice {
  subject: string;
  body: string;
}

export const emptyRequestDraft = (): RequestDraft => ({
  subject: '',
  body: '',
  to: 'all',
  unitIds: [],
});

/** Brief 20 B3, P13 and D-168: the request sending makes — to all other units, or to the chosen ones. */
export function sendRequestCall(unitId: string, draft: RequestDraft) {
  const recipients =
    draft.to === 'all' ? { toAllBranches: true } : { toAllBranches: false, unitIds: draft.unitIds };
  return {
    path: `${unitHubPath(unitId)}/requests`,
    method: 'POST' as const,
    body: { subject: draft.subject, body: draft.body, ...recipients },
  };
}
