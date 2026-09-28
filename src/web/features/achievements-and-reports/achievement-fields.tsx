import type { AchievementChoices } from '../../../shared/achievements-and-reports/achievement-records';
import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import type { AchievementDraft } from './achievement-draft';
import { CategoryField } from './category-field';
import { DescriptionField } from './description-field';
import { OfficersInvolved } from './officers-involved';
import { PastDateField } from './past-date-field';

/** Brief 24 A1 and O-151: title, date (up to today), category, description and officers involved. */
export function AchievementFields(props: {
  draft: AchievementDraft;
  choices: AchievementChoices;
  set: (change: Partial<AchievementDraft>) => void;
}) {
  const t = useText().services['achievements-and-reports'].form;
  const { draft, set } = props;
  return (
    <>
      <TextField
        label={t.title}
        value={draft.title}
        onChange={(title) => {
          set({ title });
        }}
      />
      <PastDateField
        label={t.date}
        value={draft.date}
        onChange={(date) => {
          set({ date });
        }}
      />
      <CategoryField
        label={t.category}
        chooseText={t.choose}
        value={draft.categoryItemId}
        categories={props.choices.categories}
        onChange={(categoryItemId) => {
          set({ categoryItemId });
        }}
      />
      <DescriptionField
        label={t.description}
        value={draft.description}
        onChange={(description) => {
          set({ description });
        }}
      />
      <OfficersInvolved
        people={props.choices.people}
        chosen={draft.officerPersonIds}
        onChange={(officerPersonIds) => {
          set({ officerPersonIds });
        }}
      />
    </>
  );
}
