import { describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../../src/shared/committee-register/role-designation';
import { checklistItemText } from '../../../../../src/web/features/administration-panel/setup-checklist/checklist-item-text';
import { arabicText } from '../../../../../src/web/text/ar';
import { englishText } from '../../../../../src/web/text/en';

describe('checklistItemText (brief 25 C6)', () => {
  it('names what each kind of item asks for', () => {
    expect(
      checklistItemText(englishText, { service: 'administration-panel', kind: 'privacy-notice' }),
    ).toBe('Set the privacy notice. It is required before anything else.');
    expect(
      checklistItemText(englishText, {
        service: 'committee-register',
        kind: 'designation',
        designation: RoleDesignation.NationalRegisterOfficer,
      }),
    ).toBe('Designate a standard role as National register officer.');
    expect(
      checklistItemText(englishText, {
        service: 'administration-panel',
        kind: 'setting',
        key: 'administration-panel.new_officer_language',
        input: { kind: 'choice', options: ['en', 'ar'] },
      }),
    ).toBe('Set "Language new officers start with".');
  });

  it('names settings in Arabic from the Arabic texts', () => {
    expect(
      checklistItemText(arabicText, {
        service: 'administration-panel',
        kind: 'setting',
        key: 'administration-panel.new_officer_language',
        input: { kind: 'choice', options: ['en', 'ar'] },
      }),
    ).toBe('اضبط «اللغة التي يبدأ بها أعضاء اللجان الجدد».');
  });
});
