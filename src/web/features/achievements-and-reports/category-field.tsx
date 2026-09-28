import type { AchievementChoices } from '../../../shared/achievements-and-reports/achievement-records';
import { useLanguage } from '../../app/language/use-language';
import { SelectField } from '../../components/select-field';

/** O-151: a category from the data administrator's list (15 B3), named in the reader's language. */
export function CategoryField(props: {
  label: string;
  chooseText: string;
  value: string;
  categories: AchievementChoices['categories'];
  onChange: (value: string) => void;
}) {
  const { language } = useLanguage();
  return (
    <SelectField
      label={props.label}
      value={props.value}
      emptyLabel={props.chooseText}
      options={props.categories.map((c) => ({
        value: c.id,
        label: language === 'ar' ? c.nameAr : c.nameEn,
      }))}
      onChange={props.onChange}
    />
  );
}
