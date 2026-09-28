import { fillText } from '../text/fill-text';

/** Brief 26 Phase 12 and D-217 (O-169): moving between the pages of a long list. */
export function PageNav(props: {
  page: number;
  pageCount: number;
  labels: { page: string; previous: string; next: string };
  onPage: (page: number) => void;
}) {
  const button = 'rounded border border-slate-400 px-3 py-1 disabled:opacity-50';
  return (
    <nav className="flex items-center gap-3 text-sm">
      <button
        type="button"
        className={button}
        disabled={props.page <= 1}
        onClick={() => {
          props.onPage(props.page - 1);
        }}
      >
        {props.labels.previous}
      </button>
      <span>{fillText(props.labels.page, { page: props.page, pages: props.pageCount })}</span>
      <button
        type="button"
        className={button}
        disabled={props.page >= props.pageCount}
        onClick={() => {
          props.onPage(props.page + 1);
        }}
      >
        {props.labels.next}
      </button>
    </nav>
  );
}
