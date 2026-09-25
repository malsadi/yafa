import { describe, expect, it, vi } from 'vitest';
import type { HandoverRecord } from '../../../../../src/shared/committee-register/handover-record';
import { HandoverChecklist } from '../../../../../src/web/features/committee-register/handovers/handover-checklist';
import { HandoverConfirm } from '../../../../../src/web/features/committee-register/handovers/handover-confirm';
import { handoverStatus } from '../../../../../src/web/features/committee-register/handovers/handover-status';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const HANDOVER: HandoverRecord = {
  id: 'h1',
  unitId: 'u1',
  unitNameEn: 'Example Branch',
  unitNameAr: 'فرع المثال',
  roleId: 'r1',
  roleNameEn: 'Treasurer',
  roleNameAr: 'أمين الصندوق',
  outgoingPersonId: 'p-out',
  outgoingName: 'Ada Example',
  incomingPersonId: 'p-in',
  incomingName: 'Ben Example',
  outgoingConfirmedAt: null,
  incomingConfirmedAt: null,
  items: [{ id: 'i1', nameEn: 'Bank access', nameAr: 'الوصول إلى البنك', tickedAt: null }],
};
const AT = '2026-09-25T10:00:00.000Z';

describe('handover parts (brief 14 C2, D-067)', () => {
  it('is open, then being confirmed, then complete', () => {
    expect(handoverStatus(HANDOVER)).toBe('open');
    expect(handoverStatus({ ...HANDOVER, outgoingConfirmedAt: AT })).toBe('confirming');
    expect(handoverStatus({ ...HANDOVER, outgoingConfirmedAt: AT, incomingConfirmedAt: AT })).toBe(
      'complete',
    );
  });

  it('lets items be ticked only while allowed, and removed only by register officers', async () => {
    setBrowserLanguages(['en-GB']);
    const render = (canTick: boolean, canRemove: boolean) =>
      renderForTest(
        <HandoverChecklist
          handover={HANDOVER}
          canTick={canTick}
          canRemove={canRemove}
          busy={false}
          onTick={vi.fn()}
          onRemove={vi.fn()}
        />,
      );
    const locked = await render(false, false);
    expect(locked.querySelector<HTMLInputElement>('input')?.disabled).toBe(true);
    expect(locked.querySelector('button')).toBeNull();
    const open = await render(true, true);
    expect(open.querySelector<HTMLInputElement>('input')?.disabled).toBe(false);
    expect(open.querySelector('button')?.textContent).toBe('Remove Bank access');
  });

  it('offers confirmation only to a named officer who has not yet confirmed', async () => {
    setBrowserLanguages(['en-GB']);
    const confirmFor = (personId: string, handover = HANDOVER) =>
      renderForTest(
        <HandoverConfirm
          handover={handover}
          personId={personId}
          busy={false}
          onConfirm={vi.fn()}
        />,
      );

    expect((await confirmFor('p-out')).querySelector('form')).not.toBeNull();
    expect((await confirmFor('p-other')).querySelector('form')).toBeNull();
    expect(
      (await confirmFor('p-out', { ...HANDOVER, outgoingConfirmedAt: AT })).querySelector('form'),
    ).toBeNull();
  });
});
