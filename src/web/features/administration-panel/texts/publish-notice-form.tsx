import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextAreaField } from '../../../components/text-area-field';

interface PublishNoticeFormProps {
  /** The current version's words, to start from; empty before the first. */
  current: { textEn: string; textAr: string | null } | null;
  busy: boolean;
  onPublish: (text: { textEn: string; textAr: string | null }) => void;
}

/**
 * Brief 13, 25 C5 and D-016: publish a new version of the privacy notice.
 * Every officer, this one included, reads it again the next time they open
 * the portal, so a tick box confirms that first.
 */
export function PublishNoticeForm({ current, busy, onPublish }: PublishNoticeFormProps) {
  const t = useText().services['administration-panel'];
  const [textEn, setTextEn] = useState(current?.textEn ?? '');
  const [textAr, setTextAr] = useState(current?.textAr ?? '');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onPublish({ textEn, textAr: textAr.trim() === '' ? null : textAr });
      }}
    >
      <TextAreaField label={t.adminTexts.english} value={textEn} onChange={setTextEn} />
      <TextAreaField label={t.adminTexts.arabic} dir="rtl" value={textAr} onChange={setTextAr} />
      <label className="flex items-center gap-2">
        <input type="checkbox" required />
        <span>{t.texts.publishConfirm}</span>
      </label>
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={busy || textEn.trim() === ''}
      >
        {t.texts.publish}
      </button>
    </form>
  );
}
