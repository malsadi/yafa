import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { describeSettingInput } from '../../../src/worker/core/settings';

describe('describeSettingInput (D-074)', () => {
  it('reads choices, yes or no, and whole numbers from a setting’s schema', () => {
    expect(describeSettingInput({ schema: z.enum(['en', 'ar']) })).toEqual({
      kind: 'choice',
      options: ['en', 'ar'],
    });
    expect(describeSettingInput({ schema: z.boolean() })).toEqual({ kind: 'yes-no' });
    expect(describeSettingInput({ schema: z.number().int().positive() })).toEqual({
      kind: 'whole-number',
    });
  });

  it('leaves any other shape to the Service settings screen', () => {
    expect(describeSettingInput({ schema: z.array(z.string()) })).toEqual({ kind: 'other' });
    expect(describeSettingInput({ schema: z.number() })).toEqual({ kind: 'other' });
  });

  it('reads several of fixed choices, and takes a declared input over the schema', () => {
    expect(describeSettingInput({ schema: z.array(z.enum(['a', 'b'])) })).toEqual({
      kind: 'multi-choice',
      options: ['a', 'b'],
    });
    expect(describeSettingInput({ schema: z.array(z.string()), input: { kind: 'roles' } })).toEqual(
      { kind: 'roles' },
    );
  });
});
