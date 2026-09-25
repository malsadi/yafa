import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { describeSettingInput } from '../../../src/worker/core/settings';

describe('describeSettingInput (D-074)', () => {
  it('reads choices, yes or no, and whole numbers from a setting’s schema', () => {
    expect(describeSettingInput(z.enum(['en', 'ar']))).toEqual({
      kind: 'choice',
      options: ['en', 'ar'],
    });
    expect(describeSettingInput(z.boolean())).toEqual({ kind: 'yes-no' });
    expect(describeSettingInput(z.number().int().positive())).toEqual({ kind: 'whole-number' });
  });

  it('leaves any other shape to the Service settings screen', () => {
    expect(describeSettingInput(z.array(z.string()))).toEqual({ kind: 'other' });
    expect(describeSettingInput(z.number())).toEqual({ kind: 'other' });
  });
});
