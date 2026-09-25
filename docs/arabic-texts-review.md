# Arabic interface texts, for owner review

241 texts in all.

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
| `secondFactorRequired.explanation` | Your access requires two-step verification. Set it up below, then sign out and sign in again. | <span dir="rtl">يتطلب وصولك التحقق بخطوتين. قم بإعداده أدناه، ثم سجّل الخروج وسجّل الدخول مرة أخرى.</span> |
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
| `bilingualName.nameEn` | Name in English | <span dir="rtl">الاسم بالإنجليزية</span> |
| `bilingualName.nameAr` | Name in Arabic | <span dir="rtl">الاسم بالعربية</span> |
| `bilingualName.rename` | Rename | <span dir="rtl">إعادة التسمية</span> |
| `bilingualName.renameItem` | Rename {name} | <span dir="rtl">إعادة تسمية {name}</span> |
| `bilingualName.save` | Save | <span dir="rtl">حفظ</span> |
| `bilingualName.cancel` | Cancel | <span dir="rtl">إلغاء</span> |

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
| `settings.committee-register.branches_may_add_roles` | Branches may add extra roles | <span dir="rtl">السماح للفروع بإضافة أدوار إضافية</span> |
| `settings.committee-register.lock_account_when_last_term_ends` | Lock the account when the last term ends | <span dir="rtl">قفل الحساب عند انتهاء آخر فترة عضوية</span> |
| `settings.committee-register.terms_ending_soon_window_days` | Terms ending soon window (days) | <span dir="rtl">مدة التنبيه بقرب انتهاء فترات العضوية (بالأيام)</span> |
| `settings.committee-register.roles_requiring_mfa` | Roles requiring multi-factor authentication | <span dir="rtl">الأدوار التي تتطلب التحقق متعدد العوامل</span> |
| `register.noRegister` | You have no register to open. | <span dir="rtl">ليس لديك سجل لفتحه.</span> |
| `register.unit` | Unit | <span dir="rtl">الوحدة</span> |
| `register.inactive` | This branch is inactive. Its register is read-only. | <span dir="rtl">هذا الفرع غير نشط. سجله للقراءة فقط.</span> |
| `register.tabs.officers` | Officers | <span dir="rtl">أعضاء اللجنة</span> |
| `register.tabs.past-officers` | Past officers | <span dir="rtl">الأعضاء السابقون</span> |
| `register.tabs.roles` | Roles | <span dir="rtl">الأدوار</span> |
| `register.tabs.elections` | Elections | <span dir="rtl">الانتخابات</span> |
| `register.tabs.handovers` | Handovers | <span dir="rtl">عمليات التسليم</span> |
| `register.name` | Name | <span dir="rtl">الاسم</span> |
| `register.email` | Email | <span dir="rtl">البريد الإلكتروني</span> |
| `register.phone` | Phone | <span dir="rtl">الهاتف</span> |
| `register.role` | Role | <span dir="rtl">الدور</span> |
| `register.chooseRole` | Choose a role | <span dir="rtl">اختر دورًا</span> |
| `register.startDate` | Start date | <span dir="rtl">تاريخ البدء</span> |
| `register.endDate` | End date | <span dir="rtl">تاريخ الانتهاء</span> |
| `register.endDateOptional` | End date (if known) | <span dir="rtl">تاريخ الانتهاء (إن كان معروفًا)</span> |
| `register.save` | Save | <span dir="rtl">حفظ</span> |
| `register.cancel` | Cancel | <span dir="rtl">إلغاء</span> |
| `register.from` | from {start} | <span dir="rtl">منذ {start}</span> |
| `register.fromTo` | {start} to {end} | <span dir="rtl">من {start} إلى {end}</span> |
| `register.endingSoon` | Ending soon | <span dir="rtl">تنتهي قريبًا</span> |
| `register.windowNotSet` | Terms ending soon are not highlighted: the window has not been set. | <span dir="rtl">لا تُميَّز فترات العضوية التي تنتهي قريبًا: لم تُضبط المدة بعد.</span> |
| `register.noOfficers` | No officers yet. | <span dir="rtl">لا يوجد أعضاء بعد.</span> |
| `register.noPastOfficers` | No past officers yet. | <span dir="rtl">لا يوجد أعضاء سابقون بعد.</span> |
| `register.addOfficer` | Add an officer | <span dir="rtl">إضافة عضو لجنة</span> |
| `register.correctDetails` | Correct name or phone | <span dir="rtl">تصحيح الاسم أو الهاتف</span> |
| `register.endTerm` | End term | <span dir="rtl">إنهاء فترة العضوية</span> |
| `register.added.sent` | The officer was added and invited to sign in. | <span dir="rtl">أُضيف عضو اللجنة ودُعي لتسجيل الدخول.</span> |
| `register.added.failed` | The officer was added, but the invitation could not be sent. Resend it from Officer accounts. | <span dir="rtl">أُضيف عضو اللجنة، لكن تعذّر إرسال الدعوة. أعد إرسالها من حسابات أعضاء اللجان.</span> |
| `register.added.not-needed` | The officer was added. They already have an account or an invitation. | <span dir="rtl">أُضيف عضو اللجنة. لديه حساب أو دعوة بالفعل.</span> |
| `register.updated` | The details were corrected. | <span dir="rtl">صُحّحت البيانات.</span> |
| `register.ended` | The term was ended. | <span dir="rtl">انتهت فترة العضوية.</span> |
| `register.endedAndLocked` | The term was ended, and their account was locked: it was their last term. | <span dir="rtl">انتهت فترة العضوية، وقُفل حسابه لأنها كانت آخر فترة له.</span> |
| `register.refusals.officers.already-holds-role` | This person already holds this role in this unit. | <span dir="rtl">يشغل هذا الشخص هذا الدور في هذه الوحدة بالفعل.</span> |
| `register.refusals.roles.not-found` | This role cannot be used in this unit. | <span dir="rtl">لا يمكن استخدام هذا الدور في هذه الوحدة.</span> |
| `register.refusals.terms.already-ended` | This term has already ended. | <span dir="rtl">انتهت فترة العضوية هذه بالفعل.</span> |
| `register.refusals.terms.end-before-start` | A term cannot end before it starts. | <span dir="rtl">لا يمكن أن تنتهي فترة العضوية قبل أن تبدأ.</span> |
| `register.refusals.terms.not-found` | This term no longer exists. | <span dir="rtl">لم تعد فترة العضوية هذه موجودة.</span> |
| `register.refusals.branches.inactive` | This branch is inactive, so its register is read-only. | <span dir="rtl">هذا الفرع غير نشط، لذا سجله للقراءة فقط.</span> |
| `register.refusals.setting.not-configured` | This waits for the data administrator: the language new officers start with is not set. | <span dir="rtl">ينتظر هذا مسؤول البيانات: لم تُضبط اللغة التي يبدأ بها أعضاء اللجان الجدد.</span> |
| `register.refusals.request.invalid` | Check the fields: an end date must come after the start date. | <span dir="rtl">تحقّق من الحقول: يجب أن يأتي تاريخ الانتهاء بعد تاريخ البدء.</span> |

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
| `screens.system-administrators` | System administrators | <span dir="rtl">مسؤولو النظام</span> |
| `screens.officer-accounts` | Officer accounts | <span dir="rtl">حسابات أعضاء اللجان</span> |
| `screens.permissions-matrix` | Permissions matrix | <span dir="rtl">مصفوفة الصلاحيات</span> |
| `screens.access-check` | Access check | <span dir="rtl">فحص الصلاحيات</span> |
| `screens.units` | Units | <span dir="rtl">الوحدات</span> |
| `screens.roles` | Roles | <span dir="rtl">الأدوار</span> |
| `screens.lists` | Lists | <span dir="rtl">القوائم</span> |
| `screens.setup-checklist` | Set-up checklist | <span dir="rtl">قائمة الإعداد</span> |
| `capabilities.administration-panel.system-administrators.manage` | Appoint and remove system administrators | <span dir="rtl">تعيين مسؤولي النظام وإعفاؤهم</span> |
| `capabilities.administration-panel.officer-accounts.manage` | Manage officer accounts | <span dir="rtl">إدارة حسابات أعضاء اللجان</span> |
| `capabilities.administration-panel.permissions-matrix.manage` | Edit the permissions matrix | <span dir="rtl">تعديل مصفوفة الصلاحيات</span> |
| `capabilities.administration-panel.access-check.read` | Use the access check | <span dir="rtl">استخدام فحص الصلاحيات</span> |
| `capabilities.administration-panel.role-designations.manage` | Designate the register officer roles | <span dir="rtl">تحديد أدوار مسؤولي السجل</span> |
| `capabilities.administration-panel.lists.manage` | Manage lists | <span dir="rtl">إدارة القوائم</span> |
| `capabilities.administration-panel.setup-checklist.read` | See the set-up checklist | <span dir="rtl">عرض قائمة الإعداد</span> |
| `settings.administration-panel.new_officer_language` | Language new officers start with | <span dir="rtl">اللغة التي يبدأ بها أعضاء اللجان الجدد</span> |
| `settings.administration-panel.arabic_digits` | Digits on Arabic screens | <span dir="rtl">الأرقام في الشاشات العربية</span> |
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
| `systemAdministrators.intro` | System administrators are appointed from the General Council and must sign in with a second factor. At least two always remain. | <span dir="rtl">يُعيَّن مسؤولو النظام من المجلس العام، ويجب أن يسجّلوا الدخول بعامل تحقق ثانٍ. يبقى اثنان منهم على الأقل دائمًا.</span> |
| `systemAdministrators.appointedOn` | appointed {date} | <span dir="rtl">عُيّن في {date}</span> |
| `systemAdministrators.remove` | Remove {name} | <span dir="rtl">إزالة {name}</span> |
| `systemAdministrators.minimumNote` | At least two system administrators must remain, so none can be removed now. | <span dir="rtl">يجب أن يبقى اثنان على الأقل من مسؤولي النظام، لذا لا يمكن إزالة أحد الآن.</span> |
| `systemAdministrators.appointHeading` | Appoint a system administrator | <span dir="rtl">تعيين مسؤول نظام</span> |
| `systemAdministrators.officer` | Officer | <span dir="rtl">عضو اللجنة</span> |
| `systemAdministrators.chooseOfficer` | Choose an officer | <span dir="rtl">اختر عضو لجنة</span> |
| `systemAdministrators.appoint` | Appoint | <span dir="rtl">تعيين</span> |
| `systemAdministrators.noCandidates` | No one else holds a current General Council term. | <span dir="rtl">لا يوجد شخص آخر يشغل حاليًا دورًا في المجلس العام.</span> |
| `systemAdministrators.refusals.system-administrators.minimum-two` | At least two system administrators must remain, so this one was not removed. | <span dir="rtl">يجب أن يبقى اثنان على الأقل من مسؤولي النظام، لذا لم تتم الإزالة.</span> |
| `systemAdministrators.refusals.system-administrators.already-appointed` | This officer is already a system administrator. | <span dir="rtl">عضو اللجنة هذا مسؤول نظام بالفعل.</span> |
| `systemAdministrators.refusals.system-administrators.needs-general-council-term` | Only someone holding a current General Council term can be appointed. | <span dir="rtl">لا يمكن تعيين إلا من يشغل حاليًا دورًا في المجلس العام.</span> |
| `systemAdministrators.refusals.system-administrators.not-found` | This person is no longer a system administrator. | <span dir="rtl">لم يعد هذا الشخص مسؤول نظام.</span> |
| `officerAccounts.intro` | Every person in the register, with their access state. Register details are edited in the Committee register. | <span dir="rtl">كل شخص في السجل مع حالة وصوله. تُعدَّل بيانات السجل في سجلّ اللجان.</span> |
| `officerAccounts.noPeople` | No one is in the register yet. | <span dir="rtl">لا يوجد أحد في السجل بعد.</span> |
| `officerAccounts.lastInvited` | last invited {date} | <span dir="rtl">آخر دعوة في {date}</span> |
| `officerAccounts.states.Not invited` | Not invited | <span dir="rtl">لم تُرسل دعوة</span> |
| `officerAccounts.states.Invited` | Invited | <span dir="rtl">مدعو</span> |
| `officerAccounts.states.Active` | Active | <span dir="rtl">نشط</span> |
| `officerAccounts.states.Not linked` | Not linked | <span dir="rtl">غير مرتبط</span> |
| `officerAccounts.states.Locked` | Locked | <span dir="rtl">مقفل</span> |
| `officerAccounts.actions.invitation` | Resend invitation | <span dir="rtl">إعادة إرسال الدعوة</span> |
| `officerAccounts.actions.lock` | Lock | <span dir="rtl">قفل</span> |
| `officerAccounts.actions.unlock` | Unlock | <span dir="rtl">فتح القفل</span> |
| `officerAccounts.actions.sign-out` | Sign out of all sessions | <span dir="rtl">تسجيل الخروج من كل الجلسات</span> |
| `officerAccounts.actions.remove-push-devices` | Remove push devices | <span dir="rtl">إزالة أجهزة الإشعارات</span> |
| `officerAccounts.actionFor.invitation` | Resend invitation to {name} | <span dir="rtl">إعادة إرسال الدعوة إلى {name}</span> |
| `officerAccounts.actionFor.lock` | Lock {name} | <span dir="rtl">قفل حساب {name}</span> |
| `officerAccounts.actionFor.unlock` | Unlock {name} | <span dir="rtl">فتح قفل حساب {name}</span> |
| `officerAccounts.actionFor.sign-out` | Sign {name} out of all sessions | <span dir="rtl">تسجيل خروج {name} من كل الجلسات</span> |
| `officerAccounts.actionFor.remove-push-devices` | Remove push devices of {name} | <span dir="rtl">إزالة أجهزة الإشعارات الخاصة بـ {name}</span> |
| `officerAccounts.done.invitation` | The invitation was sent. | <span dir="rtl">أُرسلت الدعوة.</span> |
| `officerAccounts.done.lock` | The account was locked. | <span dir="rtl">قُفل الحساب.</span> |
| `officerAccounts.done.unlock` | The account was unlocked. | <span dir="rtl">فُتح قفل الحساب.</span> |
| `officerAccounts.done.sign-out` | All sessions were signed out. | <span dir="rtl">سُجّل الخروج من كل الجلسات.</span> |
| `officerAccounts.done.remove-push-devices` | Push devices were removed. | <span dir="rtl">أُزيلت أجهزة الإشعارات.</span> |
| `officerAccounts.invitationFailed` | The invitation could not be sent. Try again later. | <span dir="rtl">تعذّر إرسال الدعوة. حاول لاحقًا.</span> |
| `officerAccounts.refusals.officer-accounts.not-found` | This person is no longer in the register. | <span dir="rtl">لم يعد هذا الشخص في السجل.</span> |
| `officerAccounts.refusals.officer-accounts.already-has-account` | This person already has an account. | <span dir="rtl">لدى هذا الشخص حساب بالفعل.</span> |
| `officerAccounts.refusals.officer-accounts.no-account` | This person has no account. | <span dir="rtl">ليس لدى هذا الشخص حساب.</span> |
| `officerAccounts.refusals.officer-accounts.already-locked` | This account is already locked. | <span dir="rtl">هذا الحساب مقفل بالفعل.</span> |
| `officerAccounts.refusals.officer-accounts.not-locked` | This account is not locked. | <span dir="rtl">هذا الحساب غير مقفل.</span> |
| `officerAccounts.refusals.clerk.unavailable` | The sign-in service could not be reached. Try again later. | <span dir="rtl">تعذّر الوصول إلى خدمة تسجيل الدخول. حاول لاحقًا.</span> |
| `accessCheck.intro` | Choose an officer to see exactly which capabilities they hold, where, and why. This shows permissions only, never their data. | <span dir="rtl">اختر عضو لجنة لترى بالضبط الصلاحيات التي يملكها، وأين، ولماذا. تُعرض الصلاحيات فقط، ولا تُعرض بياناته أبدًا.</span> |
| `accessCheck.officer` | Officer | <span dir="rtl">عضو اللجنة</span> |
| `accessCheck.chooseOfficer` | Choose an officer | <span dir="rtl">اختر عضو لجنة</span> |
| `accessCheck.isSystemAdministrator` | System administrator | <span dir="rtl">مسؤول نظام</span> |
| `accessCheck.currentTerms` | Current terms | <span dir="rtl">فترات العضوية الحالية</span> |
| `accessCheck.noCurrentTerms` | No current terms. | <span dir="rtl">لا توجد فترات عضوية حالية.</span> |
| `accessCheck.capabilities` | Capabilities | <span dir="rtl">الصلاحيات</span> |
| `accessCheck.noCapabilities` | No capabilities. | <span dir="rtl">لا توجد صلاحيات.</span> |
| `accessCheck.portalWide` | Portal-wide | <span dir="rtl">على مستوى البوابة</span> |
| `accessCheck.sources.matrix` | from the permissions matrix | <span dir="rtl">من مصفوفة الصلاحيات</span> |
| `accessCheck.sources.fixed rule` | fixed rule | <span dir="rtl">قاعدة ثابتة</span> |
| `accessCheck.sources.system administrator` | as a system administrator | <span dir="rtl">بصفته مسؤول نظام</span> |
| `units.intro` | The General Council and every branch. The branch code is also used in letter reference numbers. Only the national register officer can change units. | <span dir="rtl">المجلس العام وكل الفروع. يُستخدم رمز الفرع أيضًا في أرقام مراجع الخطابات. مسؤول السجل الوطني وحده يستطيع تغيير الوحدات.</span> |
| `units.code` | Code | <span dir="rtl">الرمز</span> |
| `units.nameEn` | Name in English | <span dir="rtl">الاسم بالإنجليزية</span> |
| `units.nameAr` | Name in Arabic | <span dir="rtl">الاسم بالعربية</span> |
| `units.area` | Area | <span dir="rtl">المنطقة</span> |
| `units.status` | Status | <span dir="rtl">الحالة</span> |
| `units.chooseStatus` | Choose a status | <span dir="rtl">اختر الحالة</span> |
| `units.statuses.active` | Active | <span dir="rtl">نشط</span> |
| `units.statuses.inactive` | Inactive | <span dir="rtl">غير نشط</span> |
| `units.edit` | Edit | <span dir="rtl">تعديل</span> |
| `units.editUnit` | Edit {name} | <span dir="rtl">تعديل {name}</span> |
| `units.save` | Save | <span dir="rtl">حفظ</span> |
| `units.cancel` | Cancel | <span dir="rtl">إلغاء</span> |
| `units.addBranch` | Add a branch | <span dir="rtl">إضافة فرع</span> |
| `units.add` | Add branch | <span dir="rtl">إضافة الفرع</span> |
| `units.refusals.branches.code-taken` | Another unit already uses this code. | <span dir="rtl">هذا الرمز مستخدم لوحدة أخرى.</span> |
| `units.refusals.branches.general-council-has-no-area` | The General Council has no area. | <span dir="rtl">ليس للمجلس العام منطقة.</span> |
| `units.refusals.branches.general-council-always-active` | The General Council is always active. | <span dir="rtl">المجلس العام نشط دائمًا.</span> |
| `units.refusals.branches.not-found` | This unit no longer exists. | <span dir="rtl">لم تعد هذه الوحدة موجودة.</span> |
| `units.refusals.request.invalid` | Check the fields: every one is required, and the code uses only letters, digits and hyphens. | <span dir="rtl">تحقّق من الحقول: كلها مطلوبة، والرمز يتكوّن من حروف وأرقام وشرطات فقط.</span> |
| `roles.standardRoles` | Standard roles | <span dir="rtl">الأدوار القياسية</span> |
| `roles.standardRolesIntro` | The national list of roles used by every branch, so the same role means the same thing everywhere. Only the national register officer maintains it. | <span dir="rtl">القائمة الوطنية للأدوار التي تستخدمها كل الفروع، ليكون للدور المعنى نفسه في كل مكان. مسؤول السجل الوطني وحده يتولّى صيانتها.</span> |
| `roles.noRoles` | No standard roles yet. | <span dir="rtl">لا توجد أدوار قياسية بعد.</span> |
| `roles.addRole` | Add a standard role | <span dir="rtl">إضافة دور قياسي</span> |
| `roles.add` | Add role | <span dir="rtl">إضافة الدور</span> |
| `roles.designations` | Register officer designations | <span dir="rtl">تعيينات مسؤولي السجل</span> |
| `roles.designationsIntro` | Choose the standard role designated as each register officer. Whoever holds that role holds its register powers. | <span dir="rtl">اختر الدور القياسي المعيَّن لكل مسؤول سجل. من يشغل ذلك الدور يملك صلاحيات السجل الخاصة به.</span> |
| `roles.noDesignatedRole` | No role designated | <span dir="rtl">لا يوجد دور معيَّن</span> |
| `roles.refusals.roles.name-taken` | Another role already has this name. | <span dir="rtl">يوجد دور آخر بهذا الاسم.</span> |
| `roles.refusals.roles.not-found` | This role no longer exists. | <span dir="rtl">لم يعد هذا الدور موجودًا.</span> |
| `roles.refusals.role-designations.standard-role-not-found` | Only a standard role can be designated. | <span dir="rtl">لا يمكن تعيين إلا دور قياسي.</span> |
| `roles.refusals.role-designations.role-already-designated` | This role already holds the other designation. A role holds at most one. | <span dir="rtl">هذا الدور يحمل التعيين الآخر بالفعل. يحمل الدور تعيينًا واحدًا على الأكثر.</span> |
| `roles.refusals.request.invalid` | Both names are required. | <span dir="rtl">الاسمان مطلوبان.</span> |
| `lists.intro` | The lists officers choose from across the portal. Each item has a name in English and Arabic. | <span dir="rtl">القوائم التي يختار منها أعضاء اللجان في أنحاء البوابة. لكل عنصر اسم بالإنجليزية والعربية.</span> |
| `lists.names.event-types` | Event types | <span dir="rtl">أنواع الفعاليات</span> |
| `lists.names.meeting-types` | Meeting types | <span dir="rtl">أنواع الاجتماعات</span> |
| `lists.names.achievement-categories` | Achievement categories | <span dir="rtl">فئات الإنجازات</span> |
| `lists.names.equipment-conditions` | Equipment conditions | <span dir="rtl">حالات المعدات</span> |
| `lists.names.handover-checklist-items` | Handover checklist items | <span dir="rtl">عناصر قائمة التسليم</span> |
| `lists.empty` | No items yet. | <span dir="rtl">لا توجد عناصر بعد.</span> |
| `lists.add` | Add item | <span dir="rtl">إضافة عنصر</span> |
| `lists.archiveCategories` | Archive categories | <span dir="rtl">فئات الأرشيف</span> |
| `lists.archiveCategoriesFixed` | These categories are fixed by the portal and cannot be changed. | <span dir="rtl">هذه الفئات ثابتة تحددها البوابة ولا يمكن تغييرها.</span> |
| `lists.refusals.lists.name-taken` | Another item in this list already has this name. | <span dir="rtl">يوجد عنصر آخر في هذه القائمة بهذا الاسم.</span> |
| `lists.refusals.lists.item-not-found` | This item no longer exists. | <span dir="rtl">لم يعد هذا العنصر موجودًا.</span> |
| `lists.refusals.request.invalid` | Both names are required. | <span dir="rtl">الاسمان مطلوبان.</span> |
| `setupChecklist.intro` | Everything required that is not yet configured, by service. A service cannot be switched on for a unit until its checklist is complete. | <span dir="rtl">كل ما هو مطلوب ولم يُضبط بعد، حسب الخدمة. لا يمكن تشغيل خدمة لوحدة ما حتى تكتمل قائمتها.</span> |
| `setupChecklist.complete` | Nothing is waiting: everything required is configured. | <span dir="rtl">لا شيء بانتظار الإعداد: كل ما هو مطلوب مضبوط.</span> |
| `setupChecklist.privacyNotice` | Set the privacy notice. It is required before anything else. | <span dir="rtl">اضبط إشعار الخصوصية. وهو مطلوب قبل أي شيء آخر.</span> |
| `setupChecklist.designation` | Designate a standard role as {designation}. | <span dir="rtl">عيّن دورًا قياسيًا بصفة {designation}.</span> |
| `setupChecklist.setting` | Set "{setting}". | <span dir="rtl">اضبط «{setting}».</span> |
