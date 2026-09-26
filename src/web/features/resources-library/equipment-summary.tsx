import type { EquipmentRecord } from '../../../shared/resources-library/equipment';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 16 C1 and D-099: how many, where, its condition, and how many are out on loan. */
export function EquipmentSummary({ item }: { item: EquipmentRecord }) {
  const t = useText().services['resources-library'].equipment;
  const { language } = useLanguage();
  const condition = language === 'ar' ? item.conditionNameAr : item.conditionNameEn;
  return (
    <>
      <p className="text-sm">
        {fillText(t.summary, { quantity: item.quantity, location: item.location, condition })}
      </p>
      {item.outOnLoan > 0 && (
        <p className="text-sm">{fillText(t.outOnLoan, { count: item.outOnLoan })}</p>
      )}
    </>
  );
}
