import {
  LOGO_POSITIONS,
  type LogoPosition,
} from '../../../../shared/administration-panel/branding-files';
import { useText } from '../../../app/language/use-text';

interface LogoPositionControlProps {
  value: LogoPosition | null;
  busy: boolean;
  onChange: (position: LogoPosition) => void;
}

/** D-089: the letterhead's one choice — where the logo sits, mirrored in Arabic. */
export function LogoPositionControl({ value, busy, onChange }: LogoPositionControlProps) {
  const t = useText().services['administration-panel'].branding;
  return (
    <fieldset className="flex flex-col gap-1" disabled={busy}>
      <legend className="font-medium">{t.logoPosition}</legend>
      <p className="text-sm text-slate-600">{t.logoPositionHint}</p>
      {LOGO_POSITIONS.map((position) => (
        <label key={position} className="flex items-center gap-2">
          <input
            type="radio"
            name="logo-position"
            checked={value === position}
            onChange={() => {
              onChange(position);
            }}
          />
          {t.positions[position]}
        </label>
      ))}
    </fieldset>
  );
}
