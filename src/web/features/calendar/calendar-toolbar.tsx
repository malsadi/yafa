import { useText } from '../../app/language/use-text';
import { CalendarChoiceGroup } from './calendar-choice-group';
import { CalendarPeriodNav } from './calendar-period-nav';
import type { CalendarViewKind } from './calendar-period';
import type { CalendarState } from './use-calendar-state';

const VIEWS: readonly CalendarViewKind[] = ['month', 'week', 'list'];
const SCOPES = ['branch', 'all'] as const;

/** Brief 19 B1 and B2: month, week or list; this branch or all branches; earlier and later. */
export function CalendarToolbar(props: { state: CalendarState }) {
  const t = useText().services.calendar;
  const s = props.state;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4">
        <CalendarChoiceGroup
          label={t.views.label}
          choices={VIEWS.map((v) => ({ value: v, label: t.views[v] }))}
          chosen={s.view}
          onChoose={s.setView}
        />
        <CalendarChoiceGroup
          label={t.scope.label}
          choices={SCOPES.map((v) => ({ value: v, label: t.scope[v] }))}
          chosen={s.scope}
          onChoose={s.setScope}
        />
      </div>
      <CalendarPeriodNav state={s} />
    </div>
  );
}
