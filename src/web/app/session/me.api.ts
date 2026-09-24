import type { MeResponse } from '../../../shared/core/me-response';
import type { Language } from '../../../shared/core/languages';
import type { useApiRequest } from '../api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export function fetchMe(request: Request): Promise<MeResponse> {
  return request<MeResponse>('/api/me');
}

export function saveMyLanguage(request: Request, language: Language): Promise<void> {
  return request<undefined>('/api/me/language', { method: 'PUT', body: { language } });
}
