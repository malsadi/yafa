import { DOCUMENT_CSS } from './document-css';
import { LETTERHEAD_CSS } from './letterhead/letterhead-css';

/** Brief 9.4: the one stylesheet every PDF template uses — letters and documents alike. */
export const SHARED_STYLESHEET = `${LETTERHEAD_CSS}${DOCUMENT_CSS}`;
