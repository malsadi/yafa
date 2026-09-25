import type { TextShape } from '../text-shape';
import type { serviceSettingsText as english } from '../en/service-settings';

export const serviceSettingsText: TextShape<typeof english> = {
  intro:
    'كل الإعدادات، حسب الخدمة. لا قيمة لأي إعداد حتى تُدخَل هنا، وحتى ذلك الحين ينتظر ما يعتمد عليه. يُحفظ كل تغيير ويمكن استعادته.',
  required: 'مطلوب',
  notConfigured: 'غير مضبوط',
  none: 'لا شيء',
  yes: 'نعم',
  no: 'لا',
  choose: 'اختر',
  save: 'حفظ',
  cancel: 'إلغاء',
  change: 'تغيير',
  changeSetting: 'تغيير {setting}',
  cannotEnterHere: 'لا يمكن إدخال هذا الإعداد من الشاشة.',
  portalWide: 'على مستوى البوابة',
  overrides: 'قيم الوحدات الخاصة',
  noOverrides: 'لا توجد وحدة لها قيمة خاصة.',
  unit: 'الوحدة',
  chooseUnit: 'اختر وحدة',
  addOverride: 'إعطاء وحدة قيمة خاصة بها',
  removeOverride: 'إزالة القيمة الخاصة بـ {unit}',
  history: 'السجل',
  showHistory: 'عرض سجل {setting}',
  noHistory: 'لا توجد تغييرات بعد.',
  historyEntry: '{date}، {scope}، بواسطة {name}: {value}',
  overrideRemoved: 'أُزيلت القيمة الخاصة',
  restore: 'استعادة هذه القيمة',
  refusals: {
    'service-settings.not-registered': 'لم يعد هذا الإعداد موجودًا.',
    'service-settings.no-unit-override': 'لهذا الإعداد قيمة واحدة للبوابة كلها.',
    'service-settings.no-override': 'ليس لهذه الوحدة قيمة خاصة بها.',
    'service-settings.history-not-found': 'لم يعد هذا التغيير موجودًا.',
    'branches.not-found': 'لم تعد هذه الوحدة موجودة.',
    'request.invalid': 'هذه القيمة غير مسموح بها لهذا الإعداد.',
  },
};
