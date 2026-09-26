import { useText } from '../../app/language/use-text';
import { ReceivedCirculars } from './received-circulars';
import { SentCirculars } from './sent-circulars';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 A3 and A4: a branch reads the circulars it received; the General Council sends them and sees who opened them. */
export function CircularsPage() {
  const t = useText().services['communication-hub'].circulars;
  const unit = useHubUnit();
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      {unit.type === 'national' ? (
        <SentCirculars unitId={unit.id} />
      ) : (
        <ReceivedCirculars unitId={unit.id} />
      )}
    </section>
  );
}
