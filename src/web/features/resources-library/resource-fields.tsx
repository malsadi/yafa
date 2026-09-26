import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import type { ResourceDetailsDraft } from './resources.api';

/** D-103: a title, an optional description, and the language the file is in. */
export function ResourceFields(props: {
  details: ResourceDetailsDraft;
  onChange: (details: ResourceDetailsDraft) => void;
}) {
  const t = useText().services['resources-library'].resources;
  const { details, onChange } = props;
  return (
    <>
      <TextField
        label={t.title}
        value={details.title}
        onChange={(title) => {
          onChange({ ...details, title });
        }}
      />
      <TextAreaField
        label={t.description}
        value={details.description}
        onChange={(description) => {
          onChange({ ...details, description });
        }}
      />
      <SelectField
        label={t.language}
        value={details.language}
        options={(['en', 'ar'] as const).map((l) => ({ value: l, label: t.languages[l] }))}
        onChange={(l) => {
          onChange({ ...details, language: l === 'ar' ? 'ar' : 'en' });
        }}
      />
    </>
  );
}
