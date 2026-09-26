import { RESOURCES_LIBRARY_CAPABILITIES } from '../../../shared/resources-library/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 6's capabilities (brief section 16), into the catalogue (7.2). */
export function registerResourcesLibraryCapabilities(): void {
  RESOURCES_LIBRARY_CAPABILITIES.forEach(registerCapability);
}

export { fileLetter } from './correspondence/correspondence.service';
export type { FileLetterInput } from './correspondence/correspondence.service';
export type { LetterDirection } from '../../../shared/resources-library/filed-letter';
export { registerCorrespondenceRoutes } from './correspondence/correspondence.routes';
export { registerLetterTemplatesRoutes } from './letter-templates/letter-templates.routes';
export { registerLetterTemplatePreviewRoutes } from './letter-templates/letter-template-preview.routes';
export { registerTemplatesAndGuidesRoutes } from './templates-and-guides/templates-and-guides.routes';
export { registerResourceFilesRoutes } from './templates-and-guides/resource-files.routes';
export { registerVenuesRoutes } from './venues/venues.routes';
