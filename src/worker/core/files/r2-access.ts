import { ServiceUnavailableError } from '../errors';

/** What signing a link to the files bucket needs (brief 9.3, 12). */
export interface R2Access {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * The files bucket's signing details from the environment, or a refusal
 * while the owner hasn't set the R2 credentials (rule 5: say so and wait).
 */
export function readR2Access(env: {
  FILES_BUCKET_NAME: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
}): R2Access {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new ServiceUnavailableError('files.storage-not-configured');
  }
  return {
    accountId: R2_ACCOUNT_ID,
    bucket: env.FILES_BUCKET_NAME,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  };
}
