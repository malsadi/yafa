import {
  ARCHIVE_UPLOAD_CATEGORIES,
  type ArchiveCategory,
} from '../../../shared/documents-archive/archive-document';
import { useText } from '../../app/language/use-text';
import { FileField } from '../../components/file-field';
import { SelectField } from '../../components/select-field';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import type { ArchiveUploadDetails } from './use-archive-upload';
import { useNamedOptions } from './use-named-options';

/** D-096 and D-097: the file, and the document's details, for an upload. */
export function ArchiveUploadFields(props: {
  details: ArchiveUploadDetails;
  set: (field: keyof ArchiveUploadDetails) => (value: string) => void;
  categories: ArchiveCategory[];
  onFile: (file: File | null) => void;
}) {
  const t = useText().services['documents-archive'].upload;
  const named = useNamedOptions();
  const { details, set } = props;
  const uploadable = props.categories.filter((c) =>
    (ARCHIVE_UPLOAD_CATEGORIES as readonly string[]).includes(c.id),
  );
  return (
    <>
      <FileField label={t.file} onFile={props.onFile} />
      <TextField label={t.title} value={details.title} onChange={set('title')} />
      <TextAreaField
        label={t.description}
        value={details.description}
        onChange={set('description')}
      />
      <TextField
        label={t.documentDate}
        type="date"
        value={details.documentDate}
        onChange={set('documentDate')}
      />
      <SelectField
        label={t.category}
        value={details.categoryId}
        onChange={set('categoryId')}
        options={named(uploadable)}
        emptyLabel=""
      />
    </>
  );
}
