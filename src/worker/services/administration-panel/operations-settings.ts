import { z } from 'zod';
import { registerSetting } from '../../core/settings';

/**
 * Brief 11, 25 settings and D-217 (O-162, O-169): how many days a backup
 * is kept, and how many rows a page of any list shows. No defaults: until
 * set, old backups are kept and lists wait (rule 5).
 */
export function registerOperationsSettings(): void {
  registerSetting({
    key: 'administration-panel.backup_retention_days',
    label: 'Backup retention (days)',
    description: 'How long each nightly backup is kept before it is removed (11; 25 D3; D-217).',
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'administration-panel.rows_per_page',
    label: 'Rows per page',
    description: 'How many rows a page of any long list shows (26 Phase 12; D-217).',
    schema: z.number().int().positive(),
    required: true,
    unitOverrideAllowed: false,
  });
}
