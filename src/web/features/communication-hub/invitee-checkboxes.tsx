import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { ChoiceCheckboxes } from './choice-checkboxes';
import { useInvitees } from './use-conversations';

/** D-159: current officers of any unit to invite — each with their units — leaving out those already in. */
export function InviteeCheckboxes(props: {
  unitId: string;
  legend: string;
  exclude: string[];
  chosen: string[];
  onChange: (personIds: string[]) => void;
}) {
  const text = useText();
  const { language } = useLanguage();
  const invitees = useInvitees(props.unitId);
  if (!invitees.data) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  return (
    <ChoiceCheckboxes
      legend={props.legend}
      choices={invitees.data
        .filter((i) => !props.exclude.includes(i.personId))
        .map((i) => ({
          value: i.personId,
          label: `${i.name} (${language === 'ar' ? i.unitsAr : i.unitsEn})`,
        }))}
      chosen={props.chosen}
      onChange={props.onChange}
    />
  );
}
