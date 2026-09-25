import type { ChecklistItem } from '../../../../shared/administration-panel/setup-checklist';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export function fetchSetupChecklist(request: Request): Promise<ChecklistItem[]> {
  return request<ChecklistItem[]>('/api/administration-panel/setup-checklist');
}
