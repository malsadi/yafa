import { CORRESPONDENCE_AND_LETTERS_CAPABILITIES } from '../../../shared/correspondence-and-letters/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 7's capabilities (brief section 23), into the catalogue (7.2). */
export function registerCorrespondenceAndLettersCapabilities(): void {
  CORRESPONDENCE_AND_LETTERS_CAPABILITIES.forEach(registerCapability);
}

export { registerCorrespondenceAndLettersSettings } from './settings';
export { registerLettersOutRoutes } from './letters-out/letters-out.routes';
export { registerLettersInRoutes } from './letters-in/letters-in.routes';
export { generateLetter } from './letters-out/generate-letter.service';
export type { LetterRenderer } from './letters-out/letter-renderer';
