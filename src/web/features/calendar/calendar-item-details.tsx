import { useState } from 'react';
import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import type { MeUnit } from '../../../shared/core/me-response';
import { titleInLanguage } from '../../app/language/title-in-language';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { CalendarItemFacts } from './calendar-item-facts';
import { CalendarSourceLink } from './calendar-source-link';
import { CommunityDateForm } from './community-date-form';
import { CommunityDateRetireButton } from './community-date-retire-button';

const button = 'rounded border border-slate-400 px-3 py-1';

/**
 * Brief 19 A: a chosen item. Meetings and events are read-only here (A1,
 * A2), with a link to them in their own service (10.3); the unit's own community dates can be changed, retired and brought
 * back by those who manage them (A3, D-147).
 */
export function CalendarItemDetails(props: {
  item: CalendarItem;
  unit: MeUnit;
  manages: boolean;
  onClose: () => void;
}) {
  const t = useText().services.calendar;
  const { language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const { item } = props;
  if (editing)
    return (
      <CommunityDateForm
        unit={props.unit}
        date={item}
        onDone={() => {
          setEditing(false);
        }}
      />
    );
  return (
    <article
      className="flex flex-col gap-2 rounded border border-slate-300 p-3"
      style={
        item.colour ? { borderInlineStartColor: item.colour, borderInlineStartWidth: 4 } : undefined
      }
    >
      <h3 className="font-semibold">{titleInLanguage(item, language)}</h3>
      <CalendarItemFacts item={item} />
      <CalendarSourceLink item={item} unitId={props.unit.id} />
      <div className="flex flex-wrap gap-2">
        {props.manages && !item.retiredAt && (
          <button
            type="button"
            className={button}
            onClick={() => {
              setEditing(true);
            }}
          >
            {t.edit}
          </button>
        )}
        {props.manages && <CommunityDateRetireButton unitId={props.unit.id} item={item} />}
        <button type="button" className={button} onClick={props.onClose}>
          {t.close}
        </button>
      </div>
    </article>
  );
}
