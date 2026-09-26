import { z } from 'zod';
import { SWITCHABLE_ALERT_TYPES } from '../../../shared/communication-hub/alert-types';
import { registerSetting } from '../../core/settings';

/**
 * Service 4's settings (brief 20, 8.1: no default in code). The alert types
 * switched on for new officers, set on the Notifications screen (25 C4).
 * National circulars are always on, so they are not part of the choice.
 * Also how many times a phone alert is tried (D-164) and how long an
 * undelivered one is kept (D-050). Required: the hub waits for them before
 * it can be switched on (15 C6).
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
  registerSetting({
    key: 'communication-hub.push_max_attempts',
    label: 'Phone alert attempts',
    description:
      "How many times a phone alert is tried before it counts as undelivered (9.5; D-032, D-164). Cloudflare's own limit is 100.",
    schema: z.number().int().min(1).max(100),
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'communication-hub.undelivered_alert_retention_days',
    label: 'Undelivered phone alerts kept (days)',
    description:
      'How long an undelivered phone alert stays on the health screen before Push pruning removes it (15 D1; D-033, D-050).',
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
}
