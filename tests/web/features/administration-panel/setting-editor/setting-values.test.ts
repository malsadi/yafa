import { describe, expect, it } from 'vitest';
import {
  fromDraft,
  toDraft,
} from '../../../../../src/web/features/administration-panel/setting-editor/setting-draft';
import { settingValueText } from '../../../../../src/web/features/administration-panel/setting-editor/setting-value-text';
import { englishText } from '../../../../../src/web/text/en';

const ROLES = [{ id: 'r1', nameEn: 'Treasurer', nameAr: 'أمين الصندوق' }];

describe('setting values on screen (brief 25 C1, 8.1)', () => {
  it('turns a stored value into a draft and back, by the setting’s kind', () => {
    expect(fromDraft({ kind: 'yes-no' }, toDraft({ kind: 'yes-no' }, false))).toBe(false);
    expect(fromDraft({ kind: 'whole-number' }, toDraft({ kind: 'whole-number' }, 30))).toBe(30);
    expect(toDraft({ kind: 'roles' }, null)).toEqual([]);
    expect(fromDraft({ kind: 'roles' }, ['r1'])).toEqual(['r1']);
    expect(toDraft({ kind: 'choice', options: ['en'] }, null)).toBe('');
  });

  it('reads a value as the officer does: option and role names, yes or no, not set', () => {
    const read = (settingKey: string, input: Parameters<typeof toDraft>[0], value: unknown) =>
      settingValueText(englishText, 'en', { settingKey, input, value, roles: ROLES });

    expect(
      read(
        'administration-panel.new_officer_language',
        { kind: 'choice', options: ['en', 'ar'] },
        'ar',
      ),
    ).toBe('Arabic');
    expect(read('x.y', { kind: 'roles' }, ['r1'])).toBe('Treasurer');
    expect(read('x.y', { kind: 'roles' }, [])).toBe('None');
    expect(read('x.y', { kind: 'yes-no' }, true)).toBe('Yes');
    expect(read('x.y', { kind: 'whole-number' }, null)).toBe('Not set');
  });
});
