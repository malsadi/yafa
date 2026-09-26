import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../app/api/api-error';
import { getTextBundle } from '../../text';
import type { LetterTemplateDraft } from './library.api';

/**
 * D-111: the template being written as a PDF on the unit's real letterhead,
 * only when "Preview PDF" is pressed — one rendering call — saved to the
 * device. The sample words are in the template's own language.
 */
export function useLetterTemplatePdf(unitId: string) {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (draft: LetterTemplateDraft) => {
      const sample = getTextBundle(draft.language).services['resources-library'].letterTemplates
        .sample;
      const res = await fetch(`/api/resources-library/units/${unitId}/letter-templates/preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await getToken()) ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: {
            subject: draft.subject.trim() || null,
            body: draft.body,
            language: draft.language,
          },
          logoPlaceholder: sample.logo,
          signer: sample.signer,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
        throw new ApiError(res.status, body?.error?.code ?? 'server.error');
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(await res.blob());
      link.download = `${draft.title.trim() || 'letter-template'}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
  });
}
