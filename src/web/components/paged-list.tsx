import type { ReactNode } from 'react';
import type { Page } from '../../shared/core/page';
import { useText } from '../app/language/use-text';
import { ErrorAlert } from './error-alert';
import { PageNav } from './page-nav';
import { StatusMessage } from './status-message';

/**
 * Brief 26 Phase 12 and D-217: a long list, a page at a time — waiting,
 * refused (with the screen's words), empty, or its items and the way to
 * the other pages.
 */
export function PagedList<T>(props: {
  query: { isPending: boolean; error: Error | null; data: Page<T> | undefined };
  none: string;
  refusals: Partial<Record<string, string>>;
  onPage: (page: number) => void;
  children: (items: T[]) => ReactNode;
}) {
  const text = useText();
  const { query } = props;
  if (query.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (query.error) return <ErrorAlert error={query.error} refusals={props.refusals} />;
  if (!query.data || query.data.items.length === 0) return <p>{props.none}</p>;
  return (
    <>
      {props.children(query.data.items)}
      {query.data.pageCount > 1 && (
        <PageNav
          page={query.data.page}
          pageCount={query.data.pageCount}
          labels={text.portalShell.pages}
          onPage={props.onPage}
        />
      )}
    </>
  );
}
