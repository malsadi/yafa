import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router';
import type { TimelineScope } from '../../../shared/achievements-and-reports/achievement-records';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  ACHIEVEMENTS_KEY,
  fetchChoices,
  fetchContribution,
  fetchAchievement,
  fetchContributors,
  fetchReport,
  fetchReports,
  fetchTimeline,
} from './achievements.api';

/** The selected unit, and whether it is the General Council, from the layout. */
export const useAchievementUnit = () => useOutletContext<{ unitId: string; isNational: boolean }>();

function useAchievementQuery<T>(unitId: string, part: string[], fetch: () => Promise<T>) {
  return useQuery({ queryKey: [...ACHIEVEMENTS_KEY, unitId, ...part], queryFn: fetch });
}

export function useTimeline(unitId: string, scope: TimelineScope, page: number) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['timeline', scope, String(page)], () =>
    fetchTimeline(request, unitId, scope, page),
  );
}

export function useAchievement(unitId: string, id: string | undefined) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...ACHIEVEMENTS_KEY, unitId, 'one', id],
    queryFn: () => fetchAchievement(request, unitId, id ?? ''),
    enabled: id !== undefined,
  });
}

export function useAchievementChoices(unitId: string) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['choices'], () => fetchChoices(request, unitId));
}

export function useContributors(unitId: string) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['contributors'], () => fetchContributors(request, unitId));
}

export function useContribution(unitId: string, personId: string) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['contribution', personId], () =>
    fetchContribution(request, unitId, personId),
  );
}

export function useReports(unitId: string) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['reports'], () => fetchReports(request, unitId));
}

export function useReport(unitId: string, id: string) {
  const request = useApiRequest();
  return useAchievementQuery(unitId, ['reports', id], () => fetchReport(request, unitId, id));
}

/** Any change; every Achievements view refreshes after. */
export function useAchievementAction<T = unknown>() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body?: object }) =>
      request<T>(p.path, { method: p.method, body: p.body ?? {} }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY }),
  });
}
