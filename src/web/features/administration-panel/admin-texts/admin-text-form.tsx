import { useState } from 'react';
import type { AdminText } from '../../../../shared/administration-panel/admin-texts';
import { useText } from '../../../app/language/use-text';
import { TextAreaField } from '../../../components/text-area-field';

interface AdminTextFormProps {
  /** The text as written, or null until it is. */
  text: AdminText | null;
  busy: boolean;
  onSave: (text: { textEn: string; textAr: string | null }) => void;
}

/**
 * Brief 8.5 and 25 C4/C5: one of the administrator's texts, in English and
 * Arabic. English is needed; until the Arabic is written, officers reading
 * Arabic see the English (D-022), and the form says so.
 */
export function AdminTextForm({ text, busy, onSave }: AdminTextFormProps) {
  const t = useText().services['administration-panel'].adminTexts;
  const [textEn, setTextEn] = useState(text?.textEn ?? '');
  const [textAr, setTextAr] = useState(text?.textAr ?? '');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ textEn, textAr: textAr.trim() === '' ? null : textAr });
      }}
    >
      <TextAreaField label={t.english} value={textEn} onChange={setTextEn} />
      <TextAreaField label={t.arabic} dir="rtl" value={textAr} onChange={setTextAr} />
      {text?.textAr === null && <p className="text-sm text-amber-800">{t.arabicMissing}</p>}
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={busy || textEn.trim() === ''}
      >
        {t.save}
      </button>
    </form>
  );
}
