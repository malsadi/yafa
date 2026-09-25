import { describe, expect, it } from 'vitest';
import { officersOutcomeText } from '../../../../../src/web/features/committee-register/officers/officers-outcome-text';
import { englishText } from '../../../../../src/web/text/en';

describe('officersOutcomeText (brief 14 B1, 6.2)', () => {
  it('says whether the new officer was invited', () => {
    expect(officersOutcomeText(englishText, { kind: 'added', invitation: 'sent' })).toBe(
      'The officer was added and invited to sign in.',
    );
    expect(officersOutcomeText(englishText, { kind: 'added', invitation: 'failed' })).toContain(
      'could not be sent',
    );
  });

  it('says when ending the last term locked the account', () => {
    expect(officersOutcomeText(englishText, { kind: 'ended', accountLocked: true })).toContain(
      'locked',
    );
  });

  it('explains a refusal by its code, and falls back for an unknown one', () => {
    expect(
      officersOutcomeText(englishText, { kind: 'refused', code: 'officers.already-holds-role' }),
    ).toBe('This person already holds this role in this unit.');
    expect(officersOutcomeText(englishText, { kind: 'refused', code: 'unknown' })).toBe(
      englishText.portalShell.somethingWentWrong,
    );
  });
});
