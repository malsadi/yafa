import { ACHIEVEMENTS_AND_REPORTS_CAPABILITIES } from '../../../shared/achievements-and-reports/capabilities';
import { registerCapability } from '../../core/permissions';

/** Service 12's capabilities (brief section 24), into the catalogue (7.2). */
export function registerAchievementsAndReportsCapabilities(): void {
  ACHIEVEMENTS_AND_REPORTS_CAPABILITIES.forEach(registerCapability);
}

export { registerAchievementsAndReportsSettings } from './settings';
export { registerAchievementsRoutes } from './achievements/achievements.routes';
export { registerPhotosRoutes as registerAchievementPhotosRoutes } from './photos/photos.routes';
export { registerContributionsRoutes } from './contributions/contributions.routes';
export { registerAnnualReportRoutes } from './annual-report/annual-report.routes';
export { finaliseReport } from './annual-report/finalise-report.service';
