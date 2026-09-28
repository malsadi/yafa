import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type {
  AchievementChoices,
  AchievementRecord,
} from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { achievementPath, unitPath } from './achievements.api';
import { draftOf, EMPTY_ACHIEVEMENT } from './achievement-draft';
import { AchievementFields } from './achievement-fields';
import {
  useAchievementAction,
  useAchievementChoices,
  useAchievementUnit,
  useTimeline,
} from './use-achievement-queries';

function AchievementForm(props: {
  unitId: string;
  choices: AchievementChoices;
  before: AchievementRecord | null;
}) {
  const t = useText().services['achievements-and-reports'];
  const navigate = useNavigate();
  const save = useAchievementAction();
  const { before } = props;
  const [draft, setDraft] = useState(() => (before ? draftOf(before) : EMPTY_ACHIEVEMENT));
  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const request = before
          ? {
              path: achievementPath(props.unitId, before.id),
              method: 'PUT' as const,
              body: { achievement: draft, version: before.version },
            }
          : {
              path: `${unitPath(props.unitId)}/achievements`,
              method: 'POST' as const,
              body: draft,
            };
        save.mutate(request, {
          onSuccess: () => void navigate('/achievements-and-reports/timeline'),
        });
      }}
    >
      <AchievementFields
        draft={draft}
        choices={props.choices}
        set={(change) => {
          setDraft({ ...draft, ...change });
        }}
      />
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={save.isPending}
      >
        {t.form.save}
      </button>
    </form>
  );
}

/** Brief 24 A1 and O-152: record an achievement, or change one still open to change. */
export function AchievementFormPage() {
  const { unitId } = useAchievementUnit();
  const { achievementId } = useParams();
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const choices = useAchievementChoices(unitId);
  const timeline = useTimeline(unitId, 'unit');
  const before = achievementId
    ? (timeline.data?.find((a) => a.id === achievementId) ?? null)
    : null;
  const waiting = choices.isPending || (achievementId !== undefined && timeline.isPending);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">
        {achievementId ? t.form.changeHeading : t.form.heading}
      </h2>
      <ErrorAlert error={choices.error ?? timeline.error} refusals={t.refusals} />
      {waiting && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {choices.data && !waiting && (!achievementId || before) && (
        <AchievementForm unitId={unitId} choices={choices.data} before={before} />
      )}
    </section>
  );
}
