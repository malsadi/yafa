import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { EquipmentRecord } from '../../../../src/shared/resources-library/equipment';
import { RefusalAlert } from '../../../../src/web/components/refusal-alert';
import { EquipmentForm } from '../../../../src/web/features/resources-library/equipment-form';
import { OnLoanNow } from '../../../../src/web/features/resources-library/on-loan-now';
import { equipmentText } from '../../../../src/web/text/en/equipment';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const loan = (id: string, dueBack: string, returnedOn: string | null) => ({
  id,
  equipmentId: 'e',
  borrower: `Borrower ${id}`,
  quantity: 1,
  borrowedOn: '2026-09-01',
  dueBack,
  returnedOn,
  version: 1,
  history: [],
});
const ITEM: EquipmentRecord = {
  id: 'e',
  unitId: 'u',
  national: false,
  item: 'Chairs',
  quantity: 5,
  location: 'Store',
  conditionId: 'c',
  conditionNameEn: 'Good',
  conditionNameAr: 'جيد',
  retiredAt: null,
  version: 1,
  outOnLoan: 2,
  loans: [
    loan('late', '2026-09-20', null),
    loan('back', '2026-09-02', '2026-09-02'),
    loan('soon', '2026-09-05', null),
  ],
};

describe('the equipment screens (brief 16 C1, C2; D-099, D-108)', () => {
  it('lists only what is out now, soonest due first', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(<OnLoanNow items={[ITEM]} />);
    const lines = [...container.querySelectorAll('li')].map((li) => li.textContent);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('Borrower soon');
    expect(lines[1]).toContain('Borrower late');
  });

  it('states the numbers plainly when a loan is refused (D-108)', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <RefusalAlert
        code="resources-library.over-lent"
        values={{ requested: 3, quantity: 5, out: 3, left: 2 }}
        refusals={equipmentText.refusals}
      />,
    );
    expect(container.textContent).toBe(
      'Only 2 left to lend: 5 owned and 3 already out on loan. You asked for 3.',
    );
  });

  it('says the conditions list is empty, and still takes the item and quantity (15 B3; D-114)', async () => {
    setBrowserLanguages(['en-GB']);
    const onSave = vi.fn();
    const container = await renderForTest(
      <EquipmentForm
        initial={{ item: 'Chairs', quantity: 4, location: null, conditionId: null }}
        conditions={[]}
        busy={false}
        error={null}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    expect(container.textContent).toContain(equipmentText.noConditions);
    expect(container.querySelector('select')).toBeNull();
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });
    expect(onSave).toHaveBeenCalledWith({
      item: 'Chairs',
      quantity: 4,
      location: null,
      conditionId: null,
    });
  });
});
