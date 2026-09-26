import { DOCUMENTS_ARCHIVE_CAPABILITIES } from '../../../shared/documents-archive/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 13's capabilities (brief section 15), into the catalogue (7.2). */
export function registerDocumentsArchiveCapabilities(): void {
  DOCUMENTS_ARCHIVE_CAPABILITIES.forEach(registerCapability);
}

export { fileRecord } from './filing/filing.service';
export type { FileRecordInput } from './filing/filing.service';
export { isRecordFiled } from './filing/filed-already';
export { registerFindingRoutes } from './finding/finding.routes';
export { registerUploadsRoutes } from './uploads/uploads.routes';
export { registerVersionsRoutes } from './versions/versions.routes';
