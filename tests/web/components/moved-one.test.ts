import { describe, expect, it } from 'vitest';
import { movedOne } from '../../../src/web/components/moved-one';

describe('movedOne (D-071)', () => {
  it('moves one id a place up or down, leaving the rest in order', () => {
    expect(movedOne(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(movedOne(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });
});
