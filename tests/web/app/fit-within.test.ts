import { describe, expect, it } from 'vitest';
import { fitWithin } from '../../../src/web/app/files/fit-within';

describe('fitWithin (brief 9.3)', () => {
  it('scales a photo down to the maximum dimension, keeping its shape', () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(fitWithin(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
  });

  it('leaves a photo already within it as it is', () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});
