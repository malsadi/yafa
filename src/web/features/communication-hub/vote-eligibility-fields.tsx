import { VOTE_ELIGIBILITIES } from '../../../shared/communication-hub/notice-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { StatusMessage } from '../../components/status-message';
import { ChoiceCheckboxes } from './choice-checkboxes';
import type { VoteDraft } from './notice-draft';
import { useVoterChoices } from './use-voter-choices';

/** P11: who can vote — all the unit's officers, officers holding chosen roles, or named officers. */
export function VoteEligibilityFields(props: {
  unitId: string;
  vote: VoteDraft;
  onChange: (vote: VoteDraft) => void;
}) {
  const text = useText();
  const t = text.services['communication-hub'].noticeForm;
  const { language } = useLanguage();
  const choices = useVoterChoices(props.unitId);
  const { vote } = props;
  return (
    <>
      <SelectField
        label={t.eligibility}
        value={vote.eligibility}
        onChange={(value) => {
          props.onChange({ ...vote, eligibility: value as VoteDraft['eligibility'] });
        }}
        options={VOTE_ELIGIBILITIES.map((e) => ({ value: e, label: t.eligibilities[e] }))}
      />
      {vote.eligibility !== 'unit' && choices.isPending && (
        <StatusMessage>{text.portalShell.loading}</StatusMessage>
      )}
      {vote.eligibility === 'roles' && choices.data && (
        <ChoiceCheckboxes
          legend={t.roles}
          choices={choices.data.roles.map((r) => ({
            value: r.id,
            label: language === 'ar' ? r.nameAr : r.nameEn,
          }))}
          chosen={vote.roleIds}
          onChange={(roleIds) => {
            props.onChange({ ...vote, roleIds });
          }}
        />
      )}
      {vote.eligibility === 'named' && choices.data && (
        <ChoiceCheckboxes
          legend={t.officers}
          choices={choices.data.officers.map((o) => ({ value: o.personId, label: o.name }))}
          chosen={vote.personIds}
          onChange={(personIds) => {
            props.onChange({ ...vote, personIds });
          }}
        />
      )}
    </>
  );
}
