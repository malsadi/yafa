import type { TextBundle } from '../../../text';
import type { OfficersOutcome } from './use-officers';

/** What the last change to the officers list did, in the officer's language. */
export function officersOutcomeText(text: TextBundle, outcome: OfficersOutcome): string {
  const t = text.services['committee-register'].register;
  switch (outcome.kind) {
    case 'added':
      return t.added[outcome.invitation];
    case 'updated':
      return t.updated;
    case 'ended':
      return outcome.accountLocked ? t.endedAndLocked : t.ended;
    case 'refused': {
      const refusals: Partial<Record<string, string>> = t.refusals;
      return refusals[outcome.code] ?? text.portalShell.somethingWentWrong;
    }
  }
}
