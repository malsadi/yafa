import { describe, expect, it } from 'vitest';
import {
  detailsOf,
  draftOf,
  EMPTY_VENUE,
} from '../../../../src/web/features/resources-library/venue-draft';

describe('a venue as written in its form (D-105)', () => {
  it('needs only the name; every empty detail is left out', () => {
    expect(detailsOf({ ...EMPTY_VENUE, name: ' Hall ' })).toEqual({
      name: 'Hall',
      address: null,
      capacity: null,
      facilities: null,
      contactName: null,
      contactPhone: null,
      contactEmail: null,
      typicalCostPence: null,
      typicalCostNote: null,
    });
  });

  it('reads the cost in pounds as pence, and refuses a cost it cannot read', () => {
    expect(
      detailsOf({ ...EMPTY_VENUE, name: 'Hall', typicalCostPence: '150.5', capacity: '80' }),
    ).toMatchObject({
      typicalCostPence: 15050,
      capacity: 80,
    });
    expect(detailsOf({ ...EMPTY_VENUE, name: 'Hall', typicalCostPence: '£150' })).toBeNull();
  });

  it('shows a saved venue back in the form, the cost in pounds', () => {
    const venue = detailsOf({
      ...EMPTY_VENUE,
      name: 'Hall',
      typicalCostPence: '99',
      typicalCostNote: 'per day',
    });
    expect(venue && draftOf(venue)).toMatchObject({
      typicalCostPence: '99.00',
      typicalCostNote: 'per day',
      address: '',
    });
  });
});
