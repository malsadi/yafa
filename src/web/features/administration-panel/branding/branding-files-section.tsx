import type { Branding } from '../../../../shared/administration-panel/branding';
import { ApiError } from '../../../app/api/api-error';
import { useText } from '../../../app/language/use-text';
import type { TextBundle } from '../../../text';
import { RefusalAlert } from '../../../components/refusal-alert';
import { BrandingFileInput } from './branding-file-input';
import { useBrandingUpload } from './use-branding-upload';

const FONTS = '.woff2,.ttf,.otf';

/** Each file the screen takes: its slot, names, whether uploaded, and what it accepts. */
function inputsFor(
  t: TextBundle['services']['administration-panel']['branding'],
  files: Branding['files'],
) {
  return [
    { slot: 'logo', label: t.logo, hint: t.logoHint, uploaded: files.logo, accept: 'image/png' },
    {
      slot: 'icon',
      label: t.icon,
      hint: t.iconHint,
      uploaded: files['icon-192'] && files['icon-512'],
      accept: 'image/png',
    },
    {
      slot: 'latin-font',
      label: t.latinFont,
      hint: t.fontHint,
      uploaded: files['latin-font'],
      accept: FONTS,
    },
    {
      slot: 'arabic-font',
      label: t.arabicFont,
      hint: t.fontHint,
      uploaded: files['arabic-font'],
      accept: FONTS,
    },
  ] as const;
}

/** Brief 25 C3, D-080 and D-084: the logo, the square icon and the two fonts. */
export function BrandingFilesSection({ files }: { files: Branding['files'] }) {
  const t = useText().services['administration-panel'].branding;
  const upload = useBrandingUpload();
  const error = upload.error;
  const refusal = error instanceof ApiError ? error.code : (error?.message ?? null);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.files}</h2>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      {inputsFor(t, files).map((input) => (
        <BrandingFileInput
          key={input.slot}
          {...input}
          busy={upload.isPending}
          onFile={(file) => {
            upload.mutate({ slot: input.slot, file });
          }}
        />
      ))}
    </section>
  );
}
