import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { formatMoneyGBP } from '../../../shared/core/format-money-gbp';
import type { VenueRecord } from '../../../shared/resources-library/venue';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 16 B1: the details a venue has — those not yet known are left out (D-105). */
export function VenueDetailsList({ venue }: { venue: VenueRecord }) {
  const t = useText().services['resources-library'].venues;
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  const cost =
    venue.typicalCostPence === null
      ? null
      : [formatMoneyGBP(venue.typicalCostPence, locale), venue.typicalCostNote]
          .filter(Boolean)
          .join(' — ');
  const rows: [string, string | null][] = [
    [t.address, venue.address],
    [t.capacity, venue.capacity === null ? null : fillText(t.people, { count: venue.capacity })],
    [t.facilities, venue.facilities],
    [t.contactName, venue.contactName],
    [t.contactPhone, venue.contactPhone],
    [t.contactEmail, venue.contactEmail],
    [t.typicalCost, cost ?? venue.typicalCostNote],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-slate-600">{label}</dt>
            <dd className="whitespace-pre-line">{value}</dd>
          </div>
        ))}
    </dl>
  );
}
