/** Brief 26 Phase 12 and D-217 (O-169): one page of a long list. */
export interface Page<T> {
  items: T[];
  /** The page shown, from 1. */
  page: number;
  /** How many pages there are, at least 1. */
  pageCount: number;
}
