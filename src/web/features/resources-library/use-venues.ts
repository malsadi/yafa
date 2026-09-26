import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { VenueDetails } from '../../../shared/resources-library/venue';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  addVenueNote,
  createVenue,
  fetchVenues,
  saveVenue,
  setVenueNoteRetired,
} from './venues.api';

export const venuesKey = (unitId: string) => ['resources-library', unitId, 'venues'] as const;

/** Brief 16 B1: the unit's venues and the General Council's, and changing them and their notes. */
export function useVenues(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: venuesKey(unitId) });
  const list = useQuery({
    queryKey: venuesKey(unitId),
    queryFn: () => fetchVenues(request, unitId),
  });
  const create = useMutation({
    mutationFn: (venue: VenueDetails) => createVenue(request, unitId, venue),
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: (p: { venueId: string; version: number; venue: VenueDetails }) =>
      saveVenue(request, unitId, p),
    onSettled: refresh,
  });
  const addNote = useMutation({
    mutationFn: (p: { venueId: string; text: string }) => addVenueNote(request, unitId, p),
    onSuccess: refresh,
  });
  const setNoteRetired = useMutation({
    mutationFn: (p: { venueId: string; noteId: string; retire: boolean }) =>
      setVenueNoteRetired(request, unitId, p),
    onSettled: refresh,
  });
  return { list, create, save, addNote, setNoteRetired };
}
