import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/react';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { ApiError } from '../../../app/api/api-error';

/**
 * D-090: the letterhead as a PDF, only when "Preview" is pressed — one
 * rendering call — saved to the officer's device.
 */
export function useLetterheadPdf() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (input: Omit<LetterheadInput, 'logoSrc' | 'unit'>) => {
      const res = await fetch('/api/administration-panel/branding/letterhead-preview', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await getToken()) ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: input.language,
          draft: {
            organisationName: input.organisationName,
            mainColour: input.mainColour,
            accentColour: input.accentColour,
            logoPosition: input.logoPosition,
          },
          letter: input.letter,
          logoPlaceholder: input.logoPlaceholder,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
        throw new ApiError(res.status, body?.error?.code ?? 'server.error');
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(await res.blob());
      link.download = `letterhead-${input.language}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
  });
}
