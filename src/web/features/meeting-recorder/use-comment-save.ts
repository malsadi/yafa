import { useState } from 'react';
import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useAutosave } from './use-autosave';
import { useMeetingAction } from './use-meeting-action';

type Comment = AgendaItemRecord['comments'][number];

/**
 * D-205 and D-207: a comment as typed, what was last saved, and saving it
 * — by hand or by itself at the administrator's interval — from the
 * version read, so a crossed save is refused rather than lost.
 */
export function useCommentSave(p: {
  path: string;
  current: Comment | undefined;
  seconds: number | null;
}) {
  const save = useMeetingAction();
  const [text, setText] = useState(p.current?.comment ?? '');
  const [saved, setSaved] = useState(p.current?.comment ?? '');
  const send = () => {
    const sent = text;
    save.mutate(
      { path: p.path, method: 'PUT', body: { comment: sent, version: p.current?.version ?? null } },
      {
        onSuccess: () => {
          setSaved(sent);
        },
      },
    );
  };
  useAutosave({ text, saved, busy: save.isPending, seconds: p.seconds, save: send });
  const crossed =
    p.current !== undefined && p.current.comment !== saved && p.current.comment !== text;
  return { text, setText, saved, send, save, crossed };
}
