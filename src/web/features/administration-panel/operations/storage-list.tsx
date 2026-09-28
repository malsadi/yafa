import type { SystemHealth } from '../../../../shared/administration-panel/system-health';
import { useFormatSize } from '../../../app/language/use-format-size';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** Brief 25 D1, D5: storage used per unit, the largest first. */
export function StorageList({ storage }: { storage: SystemHealth['storage'] }) {
  const t = useText().services['administration-panel'].operations.health;
  const size = useFormatSize();
  const ar = useLanguage().language === 'ar';
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-semibold">{t.storage}</h2>
      <ul className="text-sm">
        {storage.map((s) => (
          <li key={s.unitId}>
            {fillText(t.unitStorage, {
              unit: ar ? s.nameAr : s.nameEn,
              files: s.files,
              size: size(s.bytes),
            })}
          </li>
        ))}
      </ul>
    </section>
  );
}
