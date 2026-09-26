import type { EquipmentRecord } from '../../../shared/resources-library/equipment';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 16 C1, D-099 and D-114: how many, where and its condition when known, and how many are out. */
export function EquipmentSummary({ item }: { item: EquipmentRecord }) {
  const t = useText().services['resources-library'].equipment;
  const { language } = useLanguage();
  const condition = language === 'ar' ? item.conditionNameAr : item.conditionNameEn;
  const parts = [
    fillText(t.quantityIs, { quantity: item.quantity }),
    item.location && fillText(t.keptAt, { location: item.location }),
    condition && fillText(t.conditionIs, { condition }),
  ].filter(Boolean);
  return (
    <>
      <p className="text-sm">{parts.join(' · ')}</p>
      {item.outOnLoan > 0 && (
        <p className="text-sm">{fillText(t.outOnLoan, { count: item.outOnLoan })}</p>
      )}
    </>
  );
}
