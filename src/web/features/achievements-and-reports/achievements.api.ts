import type {
  AchievementChoices,
  AchievementRecord,
  Contribution,
  TimelineScope,
} from '../../../shared/achievements-and-reports/achievement-records';
import type {
  AnnualReportRecord,
  AnnualReportsView,
} from '../../../shared/achievements-and-reports/annual-report';
import type { Page } from '../../../shared/core/page';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/achievements-and-reports/units/${unitId}`;
export const achievementPath = (unitId: string, id: string) =>
  `${unitPath(unitId)}/achievements/${id}`;
export const reportPath = (unitId: string, id: string) =>
  `${unitPath(unitId)}/annual-reports/${id}`;

export const fetchTimeline = (
  request: Request,
  unitId: string,
  scope: TimelineScope,
  page: number,
) =>
  request<Page<AchievementRecord>>(
    `${unitPath(unitId)}/achievements?scope=${scope}&page=${String(page)}`,
  );
export const fetchAchievement = (request: Request, unitId: string, id: string) =>
  request<AchievementRecord>(achievementPath(unitId, id));
export const fetchChoices = (request: Request, unitId: string) =>
  request<AchievementChoices>(`${unitPath(unitId)}/achievement-choices`);
export const fetchContributors = (request: Request, unitId: string) =>
  request<{ personId: string; name: string }[]>(`${unitPath(unitId)}/contributions`);
export const fetchContribution = (request: Request, unitId: string, personId: string) =>
  request<Contribution>(`${unitPath(unitId)}/contributions/${personId}`);
export const fetchReports = (request: Request, unitId: string) =>
  request<AnnualReportsView>(`${unitPath(unitId)}/annual-reports`);
export const fetchReport = (request: Request, unitId: string, id: string) =>
  request<AnnualReportRecord>(reportPath(unitId, id));

/** Every Achievements query starts with this, so one change refreshes them all. */
export const ACHIEVEMENTS_KEY = ['achievements-and-reports'] as const;
