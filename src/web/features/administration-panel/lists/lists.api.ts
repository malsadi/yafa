import type {
  ArchiveCategory,
  ListItem,
  ListKey,
} from '../../../../shared/administration-panel/lists';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/lists';

export interface ListsView {
  items: ListItem[];
  archiveCategories: ArchiveCategory[];
}

/** An item's names, and its colour when it is a calendar colour (D-076). */
export interface ListItemInput {
  nameEn: string;
  nameAr: string;
  colour?: string;
}

export const fetchLists = (request: Request) => request<ListsView>(PATH);

export const addListItem = (request: Request, list: ListKey, input: ListItemInput) =>
  request<ListItem>(`${PATH}/${list}/items`, { method: 'POST', body: input });

export const renameListItem = (
  request: Request,
  params: { list: ListKey; itemId: string; input: ListItemInput },
) =>
  request<ListItem>(`${PATH}/${params.list}/items/${params.itemId}`, {
    method: 'PATCH',
    body: params.input,
  });

export const retireListItem = (request: Request, list: ListKey, itemId: string) =>
  request<undefined>(`${PATH}/${list}/items/${itemId}/retire`, { method: 'POST' });

export const orderList = (request: Request, list: ListKey, itemIds: string[]) =>
  request<undefined>(`${PATH}/${list}/order`, { method: 'PUT', body: { itemIds } });
