import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Each capability works in the officer's own unit. Which documents that
// shows beyond it is the brief's fixed rule (7.3): General Council documents
// are visible to all branches; a branch's to that branch and the General Council.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 13, Documents archive (brief section 15). Granted in the permissions matrix. */
export const DOCUMENTS_ARCHIVE_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'documents-archive.documents.read',
    label: 'Read the archive',
    description:
      "Search, open and download archived documents: the unit's own, and those the fixed rule shares with it (15 A5, B1, B2; 7.3).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'documents-archive.documents.upload',
    label: 'Upload to the archive',
    description:
      "Upload an official document to the unit's archive, in Governance or General, and add new versions (15 A2, A4; D-096).",
    allowedScopes: OWN_UNIT,
  },
];
