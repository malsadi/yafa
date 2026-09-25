import type { ServiceSlug } from '../core/services';
import type { SwitchRow } from '../core/switch-state';
import type { NamedChoice } from './service-settings';

/** Brief 25 C2: the services, what each needs, every stored switch, and the units. */
export interface ServiceSwitchesView {
  services: { slug: ServiceSlug; alwaysOn: boolean; needs: ServiceSlug[] }[];
  rows: SwitchRow[];
  units: NamedChoice[];
}
