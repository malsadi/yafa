import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Language } from '../../../shared/core/languages';
import { useApiRequest } from '../api/use-api-request';
import { useLanguage } from '../language/use-language';
import { ME_QUERY_KEY } from './use-me';
import { saveMyLanguage } from './me.api';

/**
 * Switches the interface at once and saves the choice on the officer's
 * person record (brief section 8.5). `canSave` is false before sign-in and
 * for a signed-in user with no linked person — there is no record to save to.
 */
export function useChangeLanguage(canSave: boolean) {
  const { setLanguage } = useLanguage();
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useCallback(
    async (language: Language) => {
      setLanguage(language);
      if (canSave) {
        await saveMyLanguage(request, language);
        await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      }
    },
    [canSave, request, queryClient, setLanguage],
  );
}
