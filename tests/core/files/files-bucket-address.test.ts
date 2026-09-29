import { describe, expect, it } from 'vitest';
import { filesBucketAddress } from '../../../src/worker/core/files';

describe('filesBucketAddress (D-222)', () => {
  const env = { FILES_BUCKET_NAME: 'example-files', FILES_BUCKET_JURISDICTION: 'eu' };

  it("is the bucket's own path on its jurisdiction's storage host", () => {
    expect(filesBucketAddress({ ...env, R2_ACCOUNT_ID: 'account-1' })).toBe(
      'https://account-1.eu.r2.cloudflarestorage.com/example-files/',
    );
  });

  it('leaves the jurisdiction out when the bucket has none', () => {
    expect(
      filesBucketAddress({ ...env, FILES_BUCKET_JURISDICTION: '', R2_ACCOUNT_ID: 'account-1' }),
    ).toBe('https://account-1.r2.cloudflarestorage.com/example-files/');
  });

  it('is null while the R2 account is not set', () => {
    expect(filesBucketAddress(env)).toBeNull();
  });
});
