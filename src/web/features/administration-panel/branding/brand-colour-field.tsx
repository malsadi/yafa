import {
  contrastAgainstWhite,
  readsOnWhite,
} from '../../../../shared/administration-panel/contrast';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

const HEX = /^#[0-9A-Fa-f]{6}$/;

interface BrandColourFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * D-082: a branding colour, typed as #RRGGBB, shown as a heading and a rule
 * on white, with its contrast against white and whether it reads at
 * normal reading contrast. The server refuses one that doesn't.
 */
export function BrandColourField({ label, value, onChange }: BrandColourFieldProps) {
  const t = useText().services['administration-panel'].branding;
  const valid = HEX.test(value);
  return (
    <label className="flex flex-col gap-1">
      <span>{label}</span>
      <span className="flex flex-wrap items-center gap-3">
        <input
          required
          dir="ltr"
          pattern="#[0-9A-Fa-f]{6}"
          placeholder="#RRGGBB"
          className="w-28 rounded border border-slate-400 p-2"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        {valid && (
          <span
            className="flex items-center gap-2 border-b-2 bg-white px-2"
            style={{ borderColor: value }}
          >
            <span className="font-semibold" style={{ color: value }}>
              {t.sampleHeading}
            </span>
            <span className={readsOnWhite(value) ? 'text-sm' : 'text-sm text-red-800'}>
              {fillText(readsOnWhite(value) ? t.contrastOk : t.contrastTooLow, {
                ratio: contrastAgainstWhite(value).toFixed(1),
              })}
            </span>
          </span>
        )}
      </span>
    </label>
  );
}
