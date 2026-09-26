import { AwsV4Signer } from 'aws4fetch';
import type { R2Access } from './r2-access';

/** R2's S3 address for the account, in the bucket's jurisdiction (an EU bucket answers only at `.eu.`). */
function endpointHost(access: R2Access): string {
  const jurisdiction = access.jurisdiction ? `${access.jurisdiction}.` : '';
  return `${access.accountId}.${jurisdiction}r2.cloudflarestorage.com`;
}

/**
 * A short-lived link straight to one object in R2 (brief 9.3), signed with
 * the S3 API's query-string signature, so the browser uploads or downloads
 * directly and the Worker never carries the file.
 */
export async function presignUrl(
  access: R2Access,
  params: {
    method: 'GET' | 'PUT';
    key: string;
    expiresSeconds: number;
    query?: Record<string, string>;
  },
): Promise<string> {
  const url = new URL(
    `https://${endpointHost(access)}/${access.bucket}/${params.key.split('/').map(encodeURIComponent).join('/')}`,
  );
  url.searchParams.set('X-Amz-Expires', String(params.expiresSeconds));
  for (const [name, value] of Object.entries(params.query ?? {})) url.searchParams.set(name, value);
  const signer = new AwsV4Signer({
    url: url.toString(),
    method: params.method,
    accessKeyId: access.accessKeyId,
    secretAccessKey: access.secretAccessKey,
    service: 's3',
    region: 'auto',
    signQuery: true,
  });
  return (await signer.sign()).url.toString();
}
