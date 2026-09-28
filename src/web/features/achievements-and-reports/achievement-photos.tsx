import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import type { AchievementRecord } from '../../../shared/achievements-and-reports/achievement-records';
import { downloadFile } from '../../app/files/download-file';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { AddPhotoForm } from './add-photo-form';
import { achievementPath } from './achievements.api';
import { useAchievementAction, useAchievementUnit } from './use-achievement-queries';

const button = 'rounded border border-slate-400 px-2 py-1 text-sm';

/** Brief 24 A1: an achievement's photos — viewed by readers; added and taken off while it can change. */
export function AchievementPhotos(props: { achievement: AchievementRecord; editable: boolean }) {
  const t = useText().services['achievements-and-reports'];
  const { unitId } = useAchievementUnit();
  const { getToken } = useAuth();
  const a = props.achievement;
  // The reader's own unit asks for it: another unit's photo is shown if the reader sees it (D-215).
  const photos = `${achievementPath(unitId, a.id)}/photos`;
  const view = useMutation({
    mutationFn: (p: { fileId: string; fileName: string }) =>
      downloadFile(() => getToken(), `${photos}/${p.fileId}/file`, p.fileName),
  });
  const remove = useAchievementAction();
  if (a.photos.length === 0 && !props.editable) return null;
  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-wrap gap-2">
        {a.photos.map((p) => (
          <li key={p.fileId} className="flex gap-1">
            <button
              type="button"
              className={button}
              disabled={view.isPending}
              onClick={() => {
                view.mutate(p);
              }}
            >
              {fillText(t.timeline.viewPhoto, { name: p.fileName })}
            </button>
            {props.editable && (
              <button
                type="button"
                className={button}
                disabled={remove.isPending}
                onClick={() => {
                  remove.mutate({ path: `${photos}/${p.fileId}/remove`, method: 'POST' });
                }}
              >
                {fillText(t.timeline.removePhoto, { name: p.fileName })}
              </button>
            )}
          </li>
        ))}
      </ul>
      {props.editable && <AddPhotoForm photosPath={photos} />}
      <ErrorAlert error={view.error ?? remove.error} refusals={t.refusals} />
    </div>
  );
}
