# Arabic interface texts, for owner review

75 texts in all.

Every English text in the portal beside its Arabic draft (D-013, D-037). Drafted by Claude Code and awaiting owner review. Each section is one file in `src/web/text/`. To change a translation, mark it here or name the key; `src/web/text/ar/` changes, and this file is regenerated with `npm run arabic-texts-review`.

Language names ("English", "العربية") are the same in both columns on purpose: each language is always named in its own script.

## `portal-shell.ts`

| Key | English | Arabic |
|---|---|---|
| `loading` | Loading… | <span dir="rtl">جارٍ التحميل…</span> |
| `notConfigured` | This has not been set up yet. Please ask your administrator. | <span dir="rtl">لم يتم إعداد هذا بعد. يرجى التواصل مع المسؤول.</span> |
| `somethingWentWrong` | Something went wrong. Please try again. | <span dir="rtl">حدث خطأ ما. يرجى المحاولة مرة أخرى.</span> |
| `pageNotFound` | This page does not exist. | <span dir="rtl">هذه الصفحة غير موجودة.</span> |
| `signOut` | Sign out | <span dir="rtl">تسجيل الخروج</span> |
| `home.welcome` | Welcome to the committee portal. | <span dir="rtl">مرحبًا بك في بوابة اللجنة.</span> |
| `home.unit` | Unit | <span dir="rtl">الوحدة</span> |
| `secondFactorRequired.title` | Two-step verification needed | <span dir="rtl">التحقق بخطوتين مطلوب</span> |
| `secondFactorRequired.explanation` | System administrators must use two-step verification to use the portal. Set it up below, then sign out and sign in again. | <span dir="rtl">يجب على مسؤولي النظام استخدام التحقق بخطوتين لاستخدام البوابة. قم بإعداده أدناه، ثم سجّل الخروج وسجّل الدخول مرة أخرى.</span> |
| `accessNotActive.title` | Access not active | <span dir="rtl">الوصول غير مفعّل</span> |
| `privacyNotice.title` | Privacy notice | <span dir="rtl">إشعار الخصوصية</span> |
| `privacyNotice.confirm` | I have read this | <span dir="rtl">لقد قرأت هذا</span> |
| `privacyNotice.continue` | Continue | <span dir="rtl">متابعة</span> |
| `privacyNotice.changed` | The privacy notice has just changed. Please read the new version. | <span dir="rtl">تم تحديث إشعار الخصوصية للتو. يرجى قراءة النسخة الجديدة.</span> |
| `navigation.label` | Services | <span dir="rtl">الخدمات</span> |
| `navigation.administration` | Administration panel | <span dir="rtl">لوحة الإدارة</span> |
| `footer.privacyNotice` | Privacy notice | <span dir="rtl">إشعار الخصوصية</span> |
| `language.label` | Language | <span dir="rtl">اللغة</span> |
| `language.en` | English | <span dir="rtl">English</span> |
| `language.ar` | العربية | <span dir="rtl">العربية</span> |
| `unitSwitcher.label` | Unit | <span dir="rtl">الوحدة</span> |
| `maintenanceBanner` | The portal is in maintenance mode. You can read everything but change nothing. | <span dir="rtl">البوابة في وضع الصيانة. يمكنك الاطلاع على كل شيء دون إجراء أي تغيير.</span> |

## `event-organiser.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Event organiser | <span dir="rtl">منظّم الفعاليات</span> |

## `meeting-recorder.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Meeting recorder | <span dir="rtl">سجلّ الاجتماعات</span> |

## `treasury.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Treasury | <span dir="rtl">الخزينة</span> |

## `communication-hub.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Communication hub | <span dir="rtl">مركز التواصل</span> |

## `calendar.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Calendar | <span dir="rtl">التقويم</span> |

## `resources-library.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Resources library | <span dir="rtl">مكتبة الموارد</span> |

## `correspondence-and-letters.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Correspondence and letters | <span dir="rtl">المراسلات والخطابات</span> |

## `committee-register.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Committee register | <span dir="rtl">سجلّ اللجان</span> |
| `capabilities.committee-register.branches.manage` | Add or change branches | <span dir="rtl">إضافة الفروع أو تعديلها</span> |
| `capabilities.committee-register.standard-roles.manage` | Maintain the standard roles | <span dir="rtl">إدارة الأدوار القياسية</span> |
| `capabilities.committee-register.branch-roles.manage` | Add a branch's extra roles | <span dir="rtl">إضافة أدوار إضافية للفرع</span> |
| `capabilities.committee-register.officers.manage` | Manage officers and terms | <span dir="rtl">إدارة أعضاء اللجان وفترات عضويتهم</span> |
| `capabilities.committee-register.elections.manage` | Record elections | <span dir="rtl">تسجيل الانتخابات</span> |
| `capabilities.committee-register.elections.confirm` | Confirm election results | <span dir="rtl">اعتماد نتائج الانتخابات</span> |
| `capabilities.committee-register.handovers.manage` | Set up handovers | <span dir="rtl">إعداد عمليات التسليم</span> |
| `capabilities.committee-register.handovers.confirm` | Take part in a handover | <span dir="rtl">المشاركة في عملية تسليم</span> |
| `capabilities.committee-register.register.read` | Read the register | <span dir="rtl">الاطلاع على السجل</span> |

## `task-tracker.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Task tracker | <span dir="rtl">متابعة المهام</span> |

## `achievements-and-reports.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Achievements and reports | <span dir="rtl">الإنجازات والتقارير</span> |

## `documents-archive.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Documents archive | <span dir="rtl">أرشيف الوثائق</span> |

## `administration-panel.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Administration panel | <span dir="rtl">لوحة الإدارة</span> |
| `stages.access-and-permissions` | Access and permissions | <span dir="rtl">الوصول والصلاحيات</span> |
| `stages.organisation` | Organisation | <span dir="rtl">التنظيم</span> |
| `stages.configuration` | Configuration | <span dir="rtl">الإعدادات</span> |
| `stages.operations` | Operations | <span dir="rtl">التشغيل</span> |
| `screens.permissions-matrix` | Permissions matrix | <span dir="rtl">مصفوفة الصلاحيات</span> |
| `capabilities.administration-panel.system-administrators.manage` | Appoint and remove system administrators | <span dir="rtl">تعيين مسؤولي النظام وإعفاؤهم</span> |
| `capabilities.administration-panel.officer-accounts.manage` | Manage officer accounts | <span dir="rtl">إدارة حسابات أعضاء اللجان</span> |
| `capabilities.administration-panel.permissions-matrix.manage` | Edit the permissions matrix | <span dir="rtl">تعديل مصفوفة الصلاحيات</span> |
| `capabilities.administration-panel.access-check.read` | Use the access check | <span dir="rtl">استخدام فحص الصلاحيات</span> |
| `capabilities.administration-panel.role-designations.manage` | Designate the register officer roles | <span dir="rtl">تحديد أدوار مسؤولي السجل</span> |
| `capabilities.administration-panel.lists.manage` | Manage lists | <span dir="rtl">إدارة القوائم</span> |
| `capabilities.administration-panel.setup-checklist.read` | See the set-up checklist | <span dir="rtl">عرض قائمة الإعداد</span> |
| `scopes.own unit` | Own unit | <span dir="rtl">الوحدة الخاصة</span> |
| `scopes.all units` | All units | <span dir="rtl">جميع الوحدات</span> |
| `scopes.national content` | National content | <span dir="rtl">المحتوى الوطني</span> |
| `designations.Branch register officer` | Branch register officer | <span dir="rtl">مسؤول سجل الفرع</span> |
| `designations.National register officer` | National register officer | <span dir="rtl">مسؤول السجل الوطني</span> |
| `permissionsMatrix.intro` | For each capability, choose which roles hold it and where. Fixed rules are set by the portal and cannot be changed here. | <span dir="rtl">لكل صلاحية، اختر الأدوار التي تملكها ونطاقها. القواعد الثابتة تحددها البوابة ولا يمكن تغييرها هنا.</span> |
| `permissionsMatrix.version` | Version {number} | <span dir="rtl">الإصدار {number}</span> |
| `permissionsMatrix.fixedRule` | Fixed rule | <span dir="rtl">قاعدة ثابتة</span> |
| `permissionsMatrix.heldBy` | Held by: | <span dir="rtl">يملكها:</span> |
| `permissionsMatrix.branchRole` | branch role | <span dir="rtl">دور خاص بالفرع</span> |
| `permissionsMatrix.noRoles` | No roles have been set up yet. | <span dir="rtl">لم يتم إعداد أي أدوار بعد.</span> |
| `permissionsMatrix.saving` | Saving… | <span dir="rtl">جارٍ الحفظ…</span> |
| `permissionsMatrix.changedElsewhere` | Someone else changed the matrix. The latest version has been loaded. | <span dir="rtl">قام شخص آخر بتغيير المصفوفة. تم تحميل أحدث إصدار.</span> |
| `permissionsMatrix.history` | History | <span dir="rtl">السجل</span> |
| `permissionsMatrix.noHistory` | No changes yet. | <span dir="rtl">لا توجد تغييرات بعد.</span> |
| `permissionsMatrix.versionBy` | Version {number}, {date}, by {email} | <span dir="rtl">الإصدار {number}، {date}، بواسطة {email}</span> |
| `permissionsMatrix.changedCell` | Changed {capability} for {role} | <span dir="rtl">تم تغيير {capability} للدور {role}</span> |
| `permissionsMatrix.restoredVersion` | Restored version {number} | <span dir="rtl">تمت استعادة الإصدار {number}</span> |
| `permissionsMatrix.restore` | Restore this version | <span dir="rtl">استعادة هذا الإصدار</span> |
| `permissionsMatrix.current` | Current version | <span dir="rtl">الإصدار الحالي</span> |
