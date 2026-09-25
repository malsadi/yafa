import { Link } from 'react-router';
import type { HandoverRecord } from '../../../../shared/committee-register/handover-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { handoverStatus } from './handover-status';

/** Brief 14 C2: handovers, each linked to its checklist. */
export function HandoverList(props: { handovers: HandoverRecord[]; showUnit: boolean }) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].handovers;
  if (props.handovers.length === 0) return <p>{t.noHandovers}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {props.handovers.map((h) => (
        <li key={h.id}>
          <Link to={`/committee-register/handovers/${h.id}`} className="underline">
            {fillText(t.summary, {
              role: { en: h.roleNameEn, ar: h.roleNameAr }[language],
              outgoing: h.outgoingName,
              incoming: h.incomingName,
            })}
            {props.showUnit && ` · ${{ en: h.unitNameEn, ar: h.unitNameAr }[language]}`}
            {` · ${t.statuses[handoverStatus(h)]}`}
          </Link>
        </li>
      ))}
    </ul>
  );
}
