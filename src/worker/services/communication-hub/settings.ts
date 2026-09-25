import { z } from 'zod';
import { SWITCHABLE_ALERT_TYPES } from '../../../shared/communication-hub/alert-types';
import { registerSetting } from '../../core/settings';

/**
 * Service 4's settings (brief 20, 8.1: no default in code). The alert types
 * switched on for new officers, set on the Notifications screen (25 C4).
 * National circulars are always on, so they are not part of the choice.
 * Required: the hub waits for it before it can be switched on (15 C6).
 */
export function registerCommunicationHubSettings(): void {
  registerSetting({
    key: 'communication-hub.alert_types_for_new_officers',
    label: 'Alert types switched on for new officers',
    description:
      'Which alerts a new officer starts with; national circulars always notify (20 C1, C2; 25 C4).',
    schema: z.array(z.enum(SWITCHABLE_ALERT_TYPES as [string, ...string[]])),
    required: true,
    unitOverrideAllowed: false,
  });
}
