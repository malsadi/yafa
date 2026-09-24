import { getTextBundle, type TextBundle } from '../../text';
import { useLanguage } from './use-language';

/** Every text in the officer's current language (brief section 8.5). */
export function useText(): TextBundle {
  return getTextBundle(useLanguage().language);
}
