import { ACHIEVEMENTS_AND_REPORTS_CAPABILITIES } from '../../src/shared/achievements-and-reports/capabilities';
import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../src/shared/administration-panel/capabilities';
import { CALENDAR_CAPABILITIES } from '../../src/shared/calendar/capabilities';
import { COMMITTEE_REGISTER_CAPABILITIES } from '../../src/shared/committee-register/capabilities';
import { COMMUNICATION_HUB_CAPABILITIES } from '../../src/shared/communication-hub/capabilities';
import { CORRESPONDENCE_AND_LETTERS_CAPABILITIES } from '../../src/shared/correspondence-and-letters/capabilities';
import type { CapabilityDefinition } from '../../src/shared/core/capability-definition';
import { PermissionScope } from '../../src/shared/core/permission-scope';
import { DOCUMENTS_ARCHIVE_CAPABILITIES } from '../../src/shared/documents-archive/capabilities';
import { EVENT_ORGANISER_CAPABILITIES } from '../../src/shared/event-organiser/capabilities';
import { MEETING_RECORDER_CAPABILITIES } from '../../src/shared/meeting-recorder/capabilities';
import { RESOURCES_LIBRARY_CAPABILITIES } from '../../src/shared/resources-library/capabilities';
import { TASK_TRACKER_CAPABILITIES } from '../../src/shared/task-tracker/capabilities';
import { TREASURY_CAPABILITIES } from '../../src/shared/treasury/capabilities';

const CATALOGUE: readonly CapabilityDefinition[] = [
  ...ACHIEVEMENTS_AND_REPORTS_CAPABILITIES,
  ...ADMINISTRATION_PANEL_CAPABILITIES,
  ...CALENDAR_CAPABILITIES,
  ...COMMITTEE_REGISTER_CAPABILITIES,
  ...COMMUNICATION_HUB_CAPABILITIES,
  ...CORRESPONDENCE_AND_LETTERS_CAPABILITIES,
  ...DOCUMENTS_ARCHIVE_CAPABILITIES,
  ...EVENT_ORGANISER_CAPABILITIES,
  ...MEETING_RECORDER_CAPABILITIES,
  ...RESOURCES_LIBRARY_CAPABILITIES,
  ...TASK_TRACKER_CAPABILITIES,
  ...TREASURY_CAPABILITIES,
];

/**
 * D-226: every matrix capability in the catalogue, each at the widest scope
 * it allows (all units where allowed), so the screen sweep sees every
 * screen. Fixed capabilities (brief 7.3) come from the role's designation
 * instead, and are left out here.
 */
export function everyGrant(): { capability: string; scope: string }[] {
  return CATALOGUE.filter((definition) => !definition.fixedGrants).map((definition) => ({
    capability: definition.capability,
    scope: definition.allowedScopes.includes(PermissionScope.AllUnits)
      ? PermissionScope.AllUnits
      : (definition.allowedScopes[0] ?? PermissionScope.OwnUnit),
  }));
}
