import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  createLetterTemplate,
  saveLetterTemplate,
  setTemplateRetired,
  type LetterTemplateDraft,
} from './library.api';
import { letterTemplatesKey } from './use-letter-templates';

/** Brief 16 D1 (P19, D-100): write, change, retire and bring back a unit's templates. */
export function useLetterTemplateActions(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: letterTemplatesKey(unitId) });
  const create = useMutation({
    mutationFn: (draft: LetterTemplateDraft) => createLetterTemplate(request, unitId, draft),
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: (p: { templateId: string; version: number; template: LetterTemplateDraft }) =>
      saveLetterTemplate(request, unitId, p),
    onSuccess: refresh,
  });
  const setRetired = useMutation({
    mutationFn: (p: { templateId: string; version: number; retire: boolean }) =>
      setTemplateRetired(request, unitId, p),
    onSettled: refresh,
  });
  return { create, save, setRetired };
}
