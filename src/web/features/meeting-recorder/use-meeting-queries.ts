import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchMeeting, fetchMeetingChoices, fetchMeetings } from './meeting-recorder.api';
import { MEETINGS_KEY } from './meeting-keys';

/** The selected unit whose Meeting recorder is open, from its layout. */
export const useMeetingUnit = (): string => useOutletContext<string>();

export function useMeetings(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...MEETINGS_KEY, unitId, 'list'],
    queryFn: () => fetchMeetings(request, unitId),
  });
}

export function useMeeting(unitId: string, meetingId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...MEETINGS_KEY, unitId, meetingId],
    queryFn: () => fetchMeeting(request, unitId, meetingId),
  });
}

export function useMeetingChoices(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...MEETINGS_KEY, unitId, 'choices'],
    queryFn: () => fetchMeetingChoices(request, unitId),
  });
}
