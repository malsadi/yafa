import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EquipmentDetails, LoanDetails } from '../../../shared/resources-library/equipment';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  correctLoan,
  createEquipment,
  fetchEquipment,
  lendEquipment,
  returnLoan,
  saveEquipment,
} from './equipment.api';

export const equipmentKey = (unitId: string) => ['resources-library', unitId, 'equipment'] as const;

/** Brief 16 C1, C2: the equipment the unit sees, and changing the unit's own and its loans. */
export function useEquipment(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: equipmentKey(unitId) });
  const list = useQuery({
    queryKey: equipmentKey(unitId),
    queryFn: () => fetchEquipment(request, unitId),
  });
  const create = useMutation({
    mutationFn: (item: EquipmentDetails) => createEquipment(request, unitId, item),
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: (p: { equipmentId: string; version: number; equipment: EquipmentDetails }) =>
      saveEquipment(request, unitId, p),
    onSettled: refresh,
  });
  const lend = useMutation({
    mutationFn: (p: { equipmentId: string; loan: LoanDetails }) =>
      lendEquipment(request, unitId, p),
    onSuccess: refresh,
  });
  const correct = useMutation({
    mutationFn: (p: { equipmentId: string; loanId: string; version: number; loan: LoanDetails }) =>
      correctLoan(request, unitId, p),
    onSettled: refresh,
  });
  const recordReturn = useMutation({
    mutationFn: (p: { equipmentId: string; loanId: string; version: number; returnedOn: string }) =>
      returnLoan(request, unitId, p),
    onSettled: refresh,
  });
  return { list, create, save, lend, correct, recordReturn };
}
