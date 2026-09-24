import { useState } from 'react';
import { useText } from '../app/language/use-text';

/** D-005: the "I have read this" tick, required before Continue works. */
export function PrivacyNoticeAcknowledgeForm(props: {
  readable: boolean;
  onContinue: () => Promise<void>;
}) {
  const text = useText();
  const [ticked, setTicked] = useState(false);
  return (
    <>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="size-5"
          disabled={!props.readable}
          checked={ticked}
          onChange={(event) => {
            setTicked(event.target.checked);
          }}
        />
        {text.portalShell.privacyNotice.confirm}
      </label>
      <button
        type="button"
        disabled={!ticked || !props.readable}
        onClick={() => {
          void props.onContinue().finally(() => {
            setTicked(false);
          });
        }}
        className="rounded bg-slate-900 px-4 py-3 text-white disabled:opacity-50"
      >
        {text.portalShell.privacyNotice.continue}
      </button>
    </>
  );
}
