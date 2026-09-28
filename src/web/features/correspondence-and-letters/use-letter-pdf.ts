import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../app/api/api-error';
import { unitPath } from './correspondence.api';
import type { LetterDraft } from './letter-draft';

/**
 * D-214 (O-142) and D-111: "Preview PDF" — the letter as the form stands,
 * on the real letterhead, only when pressed (one rendering call), saved to
 * the device. Nothing is numbered or kept.
 */
export function useLetterPdf(unitId: string) {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (draft: LetterDraft) => {
      const res = await fetch(`${unitPath(unitId)}/letters-out/preview-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${(await getToken()) ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: draft.templateId,
          recipientName: draft.recipientName,
          recipientAddress: draft.recipientAddress.trim() || null,
          fieldValues: draft.fieldValues,
          signerRoleId: draft.signerRoleId,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
        throw new ApiError(res.status, body?.error?.code ?? 'server.error');
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(await res.blob());
      link.download = 'letter-preview.pdf';
      link.click();
      URL.revokeObjectURL(link.href);
    },
  });
}
