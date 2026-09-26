import type { PushSetup } from '../../../shared/communication-hub/push-setup';
import { inLanguage } from '../../app/language/in-language';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { iphoneNotInstalled, pushSupported } from './push-device';
import { useDevicePush } from './use-device-push';

const button = 'self-start rounded border border-slate-400 px-3 py-1 disabled:opacity-50';

/**
 * Brief 20 C1, build notes and D-086: phone alerts on this device — on or
 * off — or, on an iPhone not yet on the home screen, the install guide.
 */
export function DevicePushPanel(props: { setup: PushSetup }) {
  const t = useText().services['communication-hub'];
  const s = t.alertSettings;
  const { language } = useLanguage();
  const device = useDevicePush(props.setup.publicKey);
  const guide = props.setup.installGuide;
  const blocked = typeof Notification !== 'undefined' && Notification.permission === 'denied';
  let body;
  if (!props.setup.publicKey) body = <p className="text-sm">{s.notSetUp}</p>;
  else if (iphoneNotInstalled())
    body = guide && (
      <div className="text-sm">
        <p className="font-medium">{s.iphone}</p>
        <p className="whitespace-pre-line">{inLanguage(guide, language)}</p>
      </div>
    );
  else if (!pushSupported()) body = <p className="text-sm">{s.unsupported}</p>;
  else if (blocked) body = <p className="text-sm">{s.blocked}</p>;
  else
    body = (
      <>
        <p className="text-sm">{device.subscribed ? s.phoneOn : s.phoneOff}</p>
        <button
          type="button"
          disabled={device.busy}
          className={button}
          onClick={() => void (device.subscribed ? device.turnOff() : device.turnOn())}
        >
          {device.subscribed ? s.turnOff : s.turnOn}
        </button>
      </>
    );
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{s.phone}</h3>
      {body}
      <ErrorAlert error={device.error} refusals={t.refusals} />
    </section>
  );
}
