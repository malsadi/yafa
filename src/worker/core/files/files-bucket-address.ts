/** R2's S3 host for the account, in the bucket's jurisdiction (an EU bucket answers only at `.eu.`). */
export function filesBucketHost(accountId: string, jurisdiction: string): string {
  const prefix = jurisdiction ? `${jurisdiction}.` : '';
  return `${accountId}.${prefix}r2.cloudflarestorage.com`;
}

/**
 * D-222: the files bucket's own address, the one place outside the portal's
 * origin and Clerk's that the browser may connect to, so it can send a file
 * straight to storage (brief 9.3). Null while the owner hasn't set the R2
 * account; uploads then answer "storage not configured" anyway.
 */
export function filesBucketAddress(env: {
  FILES_BUCKET_NAME: string;
  FILES_BUCKET_JURISDICTION: string;
  R2_ACCOUNT_ID?: string;
}): string | null {
  if (!env.R2_ACCOUNT_ID) return null;
  const host = filesBucketHost(env.R2_ACCOUNT_ID, env.FILES_BUCKET_JURISDICTION);
  return `https://${host}/${env.FILES_BUCKET_NAME}/`;
}
