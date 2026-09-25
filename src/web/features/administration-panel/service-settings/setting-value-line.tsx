import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface SettingValueLineProps {
  name: string;
  shown: string;
  notSet: boolean;
  onChange: () => void;
  onToggleHistory: () => void;
}

/** A setting's value as read, with Change and History. */
export function SettingValueLine(props: SettingValueLineProps) {
  const t = useText().services['administration-panel'].serviceSettings;
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className={props.notSet ? 'text-amber-800' : ''}>{props.shown}</span>
      <button
        type="button"
        className="rounded border px-3 py-1 text-sm"
        aria-label={fillText(t.changeSetting, { setting: props.name })}
        onClick={props.onChange}
      >
        {t.change}
      </button>
      <button
        type="button"
        className="text-sm underline"
        aria-label={fillText(t.showHistory, { setting: props.name })}
        onClick={props.onToggleHistory}
      >
        {t.history}
      </button>
    </p>
  );
}
