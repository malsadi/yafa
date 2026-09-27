import { describe, expect, it } from 'vitest';
import { RecordedFor } from '../../../../src/web/features/meeting-recorder/recorded-for';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const COMMENT = {
  personId: 'p3',
  name: 'Fictional Officer',
  comment: 'Agreed.',
  recordedByName: 'Fictional Secretary',
  version: 1,
};

describe('a comment says who recorded it for the officer (D-211)', () => {
  it('names the officer and the chair or secretary who recorded it, in either language', async () => {
    setBrowserLanguages(['en-GB']);
    expect((await renderForTest(<RecordedFor comment={COMMENT} />)).textContent).toBe(
      'Recorded for Fictional Officer by Fictional Secretary',
    );
    setBrowserLanguages(['ar']);
    expect((await renderForTest(<RecordedFor comment={COMMENT} />)).textContent).toBe(
      'سجّله Fictional Secretary نيابةً عن Fictional Officer',
    );
  });
});
