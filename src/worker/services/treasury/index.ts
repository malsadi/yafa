import { TREASURY_CAPABILITIES } from '../../../shared/treasury/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 3's capabilities (brief section 17), into the catalogue (7.2). */
export function registerTreasuryCapabilities(): void {
  TREASURY_CAPABILITIES.forEach(registerCapability);
}

export { registerTreasurySettings } from './settings';
export { registerAccountsRoutes } from './accounts/accounts.routes';
export { registerEntryHistoryRoutes } from './entries/entry-history.routes';
export { registerEntriesRoutes } from './entries/entries.routes';
export { registerReceiptsRoutes } from './receipts/receipts.routes';
export { registerApprovalsRoutes } from './approvals/approvals.routes';
export { registerCorrectionsRoutes } from './corrections/corrections.routes';
export { registerStatementsRoutes } from './statements/statements.routes';
export { registerYearEndCloseRoutes } from './year-end-close/year-end-close.routes';
export { openEventAccount, closeEventAccount } from './event-accounts/event-accounts.service';
export { yearEndSummary } from './year-end-summary/year-end-summary.service';
