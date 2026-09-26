import { CALENDAR_KINDS, type CalendarUnit } from '../../../shared/calendar/calendar-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { toggled, type CalendarState } from './use-calendar-state';

function Tick(props: {
  label: string;
  shown: boolean;
  onToggle: () => void;
  colour?: string | null;
}) {
  return (
    <label className="flex items-center gap-1">
      <input type="checkbox" checked={props.shown} onChange={props.onToggle} />
      {props.colour && (
        <span
          aria-hidden
          className="inline-block size-3 rounded-full"
          style={{ backgroundColor: props.colour }}
        />
      )}
      {props.label}
    </label>
  );
}

/** Brief 19 B3: show or hide each kind, and — across all branches — choose which branches to include. */
export function CalendarFilters(props: { state: CalendarState; units: CalendarUnit[] }) {
  const t = useText().services.calendar;
  const { language } = useLanguage();
  const s = props.state;
  return (
    <div className="flex flex-col gap-2">
      <fieldset className="flex flex-wrap gap-3">
        <legend className="font-medium">{t.filters.kinds}</legend>
        {CALENDAR_KINDS.map((kind) => (
          <Tick
            key={kind}
            label={t.filters[kind]}
            shown={!s.hiddenKinds.includes(kind)}
            onToggle={() => {
              s.setHiddenKinds(toggled(s.hiddenKinds, kind));
            }}
          />
        ))}
      </fieldset>
      {s.scope === 'all' && (
        <fieldset className="flex flex-wrap gap-3">
          <legend className="font-medium">{t.filters.branches}</legend>
          {props.units.map((unit) => (
            <Tick
              key={unit.id}
              label={language === 'ar' ? unit.nameAr : unit.nameEn}
              colour={unit.colour}
              shown={!s.hiddenUnits.includes(unit.id)}
              onToggle={() => {
                s.setHiddenUnits(toggled(s.hiddenUnits, unit.id));
              }}
            />
          ))}
        </fieldset>
      )}
    </div>
  );
}
