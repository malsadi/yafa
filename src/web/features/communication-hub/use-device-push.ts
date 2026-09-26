import { useCallback, useEffect, useState } from 'react';
import { useApiRequest } from '../../app/api/use-api-request';
import { currentSubscription, pushSupported, subscribeThisDevice } from './push-device';
import { PUSH_PATH } from './use-alert-settings';

/** Brief 20 C1 and 9.5: whether this device receives phone alerts, and turning them on or off. */
export function useDevicePush(publicKey: string | null) {
  const request = useApiRequest();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!pushSupported()) return;
    void currentSubscription().then((s) => {
      setSubscribed(s !== null);
    });
  }, []);
  const run = useCallback(async (step: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await step();
    } catch (failure) {
      setError(failure instanceof Error ? failure : new Error(String(failure)));
    } finally {
      setBusy(false);
    }
  }, []);
  const turnOn = () =>
    run(async () => {
      if (!publicKey) return;
      const subscription = await subscribeThisDevice(publicKey);
      await request(`${PUSH_PATH}/subscriptions`, { method: 'POST', body: subscription.toJSON() });
      setSubscribed(true);
    });
  const turnOff = () =>
    run(async () => {
      const subscription = await currentSubscription();
      if (subscription) {
        await request(`${PUSH_PATH}/subscriptions/remove`, {
          method: 'POST',
          body: { endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    });
  return { subscribed, error, busy, turnOn, turnOff };
}
