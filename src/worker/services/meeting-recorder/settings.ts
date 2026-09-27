import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Service 2's setting (brief 22; 8.1: no default in code): how often the
 * minutes save themselves while being written (D-207). Meeting types are
 * the list in 15 B3. Required before the Meeting recorder is switched on.
 */
export function registerMeetingRecorderSettings(): void {
  registerSetting({
    key: 'meeting-recorder.minutes_autosave_seconds',
    label: 'Minutes autosave interval (seconds)',
    description:
      'How often the minutes save themselves while being written, so nothing is lost on a weak signal (22 build notes; D-207).',
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
}
