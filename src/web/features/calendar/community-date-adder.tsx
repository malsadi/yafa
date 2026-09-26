import { useState } from 'react';
import type { MeUnit } from '../../../shared/core/me-response';
import { useText } from '../../app/language/use-text';
import { CommunityDateForm } from './community-date-form';

/** Brief 19 A3: adding a community date — the button, then the form. */
export function CommunityDateAdder(props: { unit: MeUnit }) {
  const t = useText().services.calendar;
  const [adding, setAdding] = useState(false);
  if (adding)
    return (
      <CommunityDateForm
        unit={props.unit}
        onDone={() => {
          setAdding(false);
        }}
      />
    );
  return (
    <button
      type="button"
      className="self-start rounded bg-slate-800 px-4 py-2 text-white"
      onClick={() => {
        setAdding(true);
      }}
    >
      {t.add}
    </button>
  );
}
