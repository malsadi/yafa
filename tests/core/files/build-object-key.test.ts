import { describe, expect, it } from 'vitest';
import { buildObjectKey } from '../../../src/worker/core/files';

describe('buildObjectKey', () => {
  it('joins the parts in the brief section 9.3 order', () => {
    const key = buildObjectKey({
      unitCode: 'BR01',
      service: 'documents-archive',
      recordId: 'rec_01ARZ3NDEKTSV4RRFFQ69G5FAV',
      fileId: 'file_01ARZ3NDEKTSV4RRFFQ69G5FAW',
      fileName: 'minutes.pdf',
    });

    expect(key).toBe(
      'BR01/documents-archive/rec_01ARZ3NDEKTSV4RRFFQ69G5FAV/file_01ARZ3NDEKTSV4RRFFQ69G5FAW-minutes.pdf',
    );
  });

  it('preserves an Arabic file name in the key', () => {
    const key = buildObjectKey({
      unitCode: 'BR01',
      service: 'documents-archive',
      recordId: 'rec_1',
      fileId: 'file_1',
      fileName: 'محضر الاجتماع.pdf',
    });

    expect(key).toBe('BR01/documents-archive/rec_1/file_1-محضر الاجتماع.pdf');
  });

  it("refuses a key that would exceed R2's 1024-byte key limit", () => {
    expect(() =>
      buildObjectKey({
        unitCode: 'BR01',
        service: 'documents-archive',
        recordId: 'r'.repeat(2000),
        fileId: 'file_1',
        fileName: 'x.pdf',
      }),
    ).toThrow(RangeError);
  });
});
