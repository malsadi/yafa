import { LISTS } from '../../../../shared/administration-panel/lists';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { ArchiveCategoriesSection } from './archive-categories-section';
import { ListSection } from './list-section';
import {
  addListItem,
  orderList,
  renameListItem,
  restoreListItem,
  retireListItem,
} from './lists.api';
import { useLists } from './use-lists';

/** Brief 25 B3: the lists the data administrator manages, and the fixed archive categories. */
export function ListsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const { lists, change, refusal } = useLists();
  if (lists.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (lists.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeading>{admin.screens.lists}</PageHeading>
        <p className="max-w-prose">{admin.lists.intro}</p>
      </div>
      {LISTS.map((list) => (
        <ListSection
          key={list}
          list={list}
          items={lists.data.items.filter((item) => item.list === list)}
          refusal={refusal?.list === list ? refusal.code : null}
          busy={change.isPending}
          onAdd={(input) => {
            change.mutate({ list, run: (r) => addListItem(r, list, input) });
          }}
          onRename={(itemId, input) => {
            change.mutate({ list, run: (r) => renameListItem(r, { list, itemId, input }) });
          }}
          onOrder={(itemIds) => {
            change.mutate({ list, run: (r) => orderList(r, list, itemIds) });
          }}
          onRetire={(itemId) => {
            change.mutate({ list, run: (r) => retireListItem(r, list, itemId) });
          }}
          onRestore={(itemId) => {
            change.mutate({ list, run: (r) => restoreListItem(r, list, itemId) });
          }}
        />
      ))}
      <ArchiveCategoriesSection categories={lists.data.archiveCategories} />
    </div>
  );
}
