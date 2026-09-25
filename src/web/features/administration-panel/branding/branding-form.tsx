import { useState } from 'react';
import type { Branding } from '../../../../shared/administration-panel/branding';
import { readsOnWhite } from '../../../../shared/administration-panel/contrast';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import { BrandColourField } from './brand-colour-field';

interface BrandingFormProps {
  branding: Branding;
  busy: boolean;
  onSave: (branding: Branding) => void;
}

/** Brief 25 C3 and D-082: the organisation name in both languages, and the two colours. */
export function BrandingForm({ branding, busy, onSave }: BrandingFormProps) {
  const t = useText().services['administration-panel'].branding;
  const [nameEn, setNameEn] = useState(branding.organisationName?.en ?? '');
  const [nameAr, setNameAr] = useState(branding.organisationName?.ar ?? '');
  const [main, setMain] = useState(branding.mainColour ?? '');
  const [accent, setAccent] = useState(branding.accentColour ?? '');
  const colours = [main, accent].every((c) => /^#[0-9A-Fa-f]{6}$/.test(c) && readsOnWhite(c));
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          organisationName: { en: nameEn, ar: nameAr.trim() === '' ? null : nameAr },
          mainColour: main,
          accentColour: accent,
        });
      }}
    >
      <TextField label={t.nameEn} value={nameEn} onChange={setNameEn} />
      <TextField label={t.nameAr} value={nameAr} dir="rtl" optional onChange={setNameAr} />
      <BrandColourField label={t.mainColour} value={main} onChange={setMain} />
      <BrandColourField label={t.accentColour} value={accent} onChange={setAccent} />
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={busy || !colours}
      >
        {t.save}
      </button>
    </form>
  );
}
