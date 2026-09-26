import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { AlertChoicesForm } from './alert-choices-form';
import { DevicePushPanel } from './device-push-panel';
import { useAlertChoices, usePushSetup } from './use-alert-settings';

/** Brief 20 C1 and C2: the officer's alert choices, and phone alerts on this device. */
export function AlertSettingsPage() {
  const text = useText();
  const t = text.services['communication-hub'];
  const choices = useAlertChoices();
  const setup = usePushSetup();
  if (choices.isPending || setup.isPending)
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (choices.isError || setup.isError)
    return <ErrorAlert error={choices.error ?? setup.error} refusals={t.refusals} />;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{t.alertSettings.heading}</h2>
      <p>{t.alertSettings.intro}</p>
      <AlertChoicesForm view={choices.data} />
      <DevicePushPanel setup={setup.data} />
    </section>
  );
}
