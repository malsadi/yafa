import type { useApiRequest } from '../api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export interface PrivacyNotice {
  id: string;
  textEn: string;
  textAr: string | null;
}

export function fetchPrivacyNotice(request: Request): Promise<PrivacyNotice> {
  return request<PrivacyNotice>('/api/privacy-notice');
}

export function acknowledgePrivacyNotice(request: Request, noticeVersionId: string): Promise<void> {
  return request<undefined>('/api/privacy-notice/acknowledgements', {
    method: 'POST',
    body: { noticeVersionId },
  });
}
