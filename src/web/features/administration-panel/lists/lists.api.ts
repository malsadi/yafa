import type {
  ArchiveCategory,
  ListItem,
  ListKey,
} from '../../../../shared/administration-panel/lists';
import type { useApiRequest } from '../../../app/api/use-api-request';
import type { BilingualNames } from '../../../components/bilingual-name-form';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/lists';

export interface ListsView {
  items: ListItem[];
  archiveCategories: ArchiveCategory[];
}

export function fetchLists(request: Request): Promise<ListsView> {
  return request<ListsView>(PATH);
}

export function addListItem(
  request: Request,
  list: ListKey,
  names: BilingualNames,
): Promise<ListItem> {
  return request<ListItem>(`${PATH}/${list}/items`, { method: 'POST', body: names });
}

export function renameListItem(
  request: Request,
  params: { list: ListKey; itemId: string; names: BilingualNames },
): Promise<ListItem> {
  return request<ListItem>(`${PATH}/${params.list}/items/${params.itemId}`, {
    method: 'PATCH',
    body: params.names,
  });
}
