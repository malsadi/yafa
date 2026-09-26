import { getTextBundle } from '../../../../web/text';
import type { AlertPlan, HubNotificationKind } from './alert-plan';
import type { PushPayload } from './hub-alert-events';

/**
 * D-162: a phone alert says only what kind it is and which unit — in both
 * languages; the device shows the officer's saved language, or its own
 * (D-026). Never the notice's, circular's or message's content.
 */
export function phoneAlertWords(params: {
  kind: HubNotificationKind;
  plan: AlertPlan;
  language: 'en' | 'ar' | null;
}): PushPayload {
  const words = (lang: 'en' | 'ar') => ({
    title: getTextBundle(lang).services['communication-hub'].phoneAlerts[params.kind],
    body: params.plan.unit
      ? lang === 'ar'
        ? params.plan.unit.nameAr
        : params.plan.unit.nameEn
      : '',
  });
  return { language: params.language, en: words('en'), ar: words('ar'), url: params.plan.url };
}
