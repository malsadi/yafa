import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ElectionPosition } from '../../../../../src/shared/committee-register/election-record';
import { ConfirmElectionForm } from '../../../../../src/web/features/committee-register/elections/confirm-election-form';
import { PositionCard } from '../../../../../src/web/features/committee-register/elections/position-card';
import { ResultsForm } from '../../../../../src/web/features/committee-register/elections/results-form';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const POSITION: ElectionPosition = {
  id: 'pos1',
  roleId: 'r1',
  roleNameEn: 'Chair',
  roleNameAr: 'الرئيس',
  seats: 1,
  candidates: [
    { id: 'c1', personId: 'p1', name: 'Ada Example', votes: 25, elected: true },
    { id: 'c2', personId: 'p2', name: 'Ben Example', votes: null, elected: null },
  ],
};

describe('election forms (brief 14 C1; D-055, D-066)', () => {
  it('shows a confirmed-style ballot read-only, with votes and who was elected', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ul>
        <PositionCard
          unitId="u1"
          position={POSITION}
          editable={false}
          busy={false}
          onRemovePosition={vi.fn()}
          onAddCandidate={vi.fn()}
          onRemoveCandidate={vi.fn()}
        />
      </ul>,
    );

    expect(container.textContent).toContain('Chair · 1 seat(s)');
    expect(container.textContent).toContain('Ada Example· 25 votesElected');
    expect(container.querySelector('button, form')).toBeNull();
  });

  it('saves every candidate’s votes as numbers, with who was elected', async () => {
    setBrowserLanguages(['en-GB']);
    const onSave = vi.fn();
    const container = await renderForTest(
      <ResultsForm positions={[POSITION]} busy={false} onSave={onSave} />,
    );
    const votes = container.querySelector<HTMLInputElement>(
      'input[aria-label="Votes for Ben Example"]',
    );
    await act(async () => {
      if (votes) {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
          votes,
          '10',
        );
        votes.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await Promise.resolve();
    });
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith([
      { candidateId: 'c1', votes: 25, elected: true },
      { candidateId: 'c2', votes: 10, elected: false },
    ]);
  });

  it('starts the new terms on the election date unless changed (D-066)', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ConfirmElectionForm electionDate="2026-03-01" busy={false} onConfirm={vi.fn()} />,
    );

    expect(container.querySelector<HTMLInputElement>('input[type="date"]')?.value).toBe(
      '2026-03-01',
    );
    expect(container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.required).toBe(
      true,
    );
  });
});
