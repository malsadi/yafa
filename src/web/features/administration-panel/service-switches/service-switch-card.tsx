import type { NamedChoice } from '../../../../shared/administration-panel/service-settings';
import { NATIONAL_SCOPE } from '../../../../shared/core/national-scope';
import type { ServiceSlug } from '../../../../shared/core/services';
import type { SwitchRow } from '../../../../shared/core/switch-state';
import { useText } from '../../../app/language/use-text';
import { RefusalAlert } from '../../../components/refusal-alert';
import { fillText } from '../../../text/fill-text';
import { toEnabled } from './switch-choice';
import { SwitchStateSelect } from './switch-state-select';
import { UnitSwitches } from './unit-switches';

interface ServiceSwitchCardProps {
  service: { slug: ServiceSlug; alwaysOn: boolean; needs: ServiceSlug[] };
  rows: SwitchRow[];
  units: NamedChoice[];
  refusal: string | null;
  busy: boolean;
  onChange: (enabled: boolean | null, unitId?: string) => void;
}

/** Brief 25 C2: one service — on or off portal-wide and per unit, and what it needs. */
export function ServiceSwitchCard(props: ServiceSwitchCardProps) {
  const text = useText();
  const t = text.services['administration-panel'].serviceSwitches;
  const { service } = props;
  const name = text.services[service.slug].name;
  const own = (scope: string) =>
    props.rows.find((r) => r.service === service.slug && r.scope === scope)?.enabled;
  const needs = service.needs.map((s) => text.services[s].name).join(', ');
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p className="font-medium">{name}</p>
      {service.needs.length > 0 && (
        <p className="text-sm">{fillText(t.needs, { services: needs })}</p>
      )}
      <RefusalAlert code={props.refusal} refusals={t.refusals} />
      {service.alwaysOn ? (
        <p className="text-sm">{t.alwaysOn}</p>
      ) : (
        <>
          <label className="flex items-center gap-2">
            {t.portalWide}
            <SwitchStateSelect
              label={fillText(t.portalWideOf, { service: name })}
              value={own(NATIONAL_SCOPE) ? 'on' : 'off'}
              canFollow={false}
              busy={props.busy}
              onChange={(v) => {
                props.onChange(toEnabled(v));
              }}
            />
          </label>
          <UnitSwitches
            serviceName={name}
            units={props.units}
            ownValue={own}
            busy={props.busy}
            onChange={props.onChange}
          />
        </>
      )}
    </li>
  );
}
