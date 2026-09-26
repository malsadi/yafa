import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// D-141: each unit sees only its own tasks, the General Council included.
// D-137: every officer sees their own tasks and changes their status with
// no capability; everything else is granted here, in the permissions matrix.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 9, Task tracker (brief section 18). */
export const TASK_TRACKER_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'task-tracker.tasks.read',
    label: 'Read the action list',
    description:
      "See all the unit's tasks, filtered by owner, status or event, and each task's history (18 B2, B4).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'task-tracker.tasks.manage',
    label: 'Manage tasks',
    description:
      "Create the unit's tasks, and change anything about them: owner, due date, details, status (18 A1 to A4; D-138).",
    allowedScopes: OWN_UNIT,
  },
];
