# Arabic interface texts, for owner review

560 texts in all.

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
| `footer.help` | Help | <span dir="rtl">المساعدة</span> |
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
| `order.moveUp` | Up | <span dir="rtl">أعلى</span> |
| `order.moveDown` | Down | <span dir="rtl">أسفل</span> |
| `order.moveUpItem` | Move {name} up | <span dir="rtl">نقل {name} إلى الأعلى</span> |
| `order.moveDownItem` | Move {name} down | <span dir="rtl">نقل {name} إلى الأسفل</span> |
| `help.title` | Help | <span dir="rtl">المساعدة</span> |

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
| `settings.communication-hub.alert_types_for_new_officers` | Alert types switched on for new officers | <span dir="rtl">أنواع التنبيهات المفعّلة لأعضاء اللجان الجدد</span> |
| `alertTypes.notices` | New notices | <span dir="rtl">الإعلانات الجديدة</span> |
| `alertTypes.votes` | Votes | <span dir="rtl">التصويتات</span> |
| `alertTypes.circulars` | National circulars | <span dir="rtl">التعاميم الوطنية</span> |
| `alertTypes.replies` | Replies | <span dir="rtl">الردود</span> |
| `alertTypes.requests` | Requests | <span dir="rtl">الطلبات</span> |

## `calendar.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Calendar | <span dir="rtl">التقويم</span> |

## `resources-library.ts`

| Key | English | Arabic |
|---|---|---|
| `name` | Resources library | <span dir="rtl">مكتبة الموارد</span> |
| `capabilities.resources-library.library.read` | Read the library | <span dir="rtl">الاطلاع على المكتبة</span> |
| `capabilities.resources-library.resources.manage` | Manage templates and guides | <span dir="rtl">إدارة النماذج والأدلة</span> |
| `capabilities.resources-library.venues.manage` | Manage venues | <span dir="rtl">إدارة الأماكن</span> |
| `capabilities.resources-library.equipment.manage` | Manage equipment and loans | <span dir="rtl">إدارة المعدات والإعارات</span> |
| `capabilities.resources-library.letter-templates.manage` | Manage letter templates | <span dir="rtl">إدارة قوالب الخطابات</span> |
| `capabilities.resources-library.correspondence.read` | Read letters in and out | <span dir="rtl">الاطلاع على الخطابات الواردة والصادرة</span> |

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
| `branchRoles.standardRoles` | Standard roles | <span dir="rtl">الأدوار القياسية</span> |
| `branchRoles.ownRoles` | This branch's own roles | <span dir="rtl">أدوار هذا الفرع الخاصة</span> |
| `branchRoles.noOwnRoles` | This branch has no roles of its own. | <span dir="rtl">ليس لهذا الفرع أدوار خاصة.</span> |
| `branchRoles.addRole` | Add a role of this branch | <span dir="rtl">إضافة دور لهذا الفرع</span> |
| `branchRoles.refusals.setting.not-configured` | This waits for the national register officer: whether branches may add extra roles is not set. | <span dir="rtl">ينتظر هذا مسؤول السجل الوطني: لم يُضبط ما إذا كان يُسمح للفروع بإضافة أدوار إضافية.</span> |
| `branchRoles.refusals.roles.branch-roles-not-allowed` | Branches may not add roles of their own. | <span dir="rtl">لا يُسمح للفروع بإضافة أدوار خاصة بها.</span> |
| `branchRoles.refusals.roles.name-taken` | Another role already has this name. | <span dir="rtl">يوجد دور آخر بهذا الاسم.</span> |
| `branchRoles.refusals.roles.not-found` | This role no longer exists. | <span dir="rtl">لم يعد هذا الدور موجودًا.</span> |
| `branchRoles.refusals.branches.inactive` | This branch is inactive, so its register is read-only. | <span dir="rtl">هذا الفرع غير نشط، لذا سجله للقراءة فقط.</span> |
| `branchRoles.refusals.request.invalid` | Both names are required. | <span dir="rtl">الاسمان مطلوبان.</span> |
| `elections.noElections` | No elections recorded yet. | <span dir="rtl">لم تُسجَّل انتخابات بعد.</span> |
| `elections.recordHeading` | Record an election | <span dir="rtl">تسجيل انتخابات</span> |
| `elections.electionDate` | Election date | <span dir="rtl">تاريخ الانتخابات</span> |
| `elections.corrects` | Correction of | <span dir="rtl">تصحيح لـ</span> |
| `elections.notACorrection` | Not a correction | <span dir="rtl">ليست تصحيحًا</span> |
| `elections.record` | Record election | <span dir="rtl">تسجيل الانتخابات</span> |
| `elections.correction` | A correction of an earlier confirmed election | <span dir="rtl">تصحيح لانتخابات سابقة معتمدة</span> |
| `elections.statuses.Draft` | Draft | <span dir="rtl">مسودة</span> |
| `elections.statuses.Confirmed` | Confirmed | <span dir="rtl">معتمدة</span> |
| `elections.electionOf` | Election of {date} | <span dir="rtl">انتخابات {date}</span> |
| `elections.termsStarted` | New terms started on {date} | <span dir="rtl">بدأت فترات العضوية الجديدة في {date}</span> |
| `elections.locked` | This election is confirmed and locked. A correction is recorded as a new election. | <span dir="rtl">هذه الانتخابات معتمدة ومقفلة. يُسجَّل التصحيح انتخاباتٍ جديدة.</span> |
| `elections.positions` | Positions | <span dir="rtl">المناصب الانتخابية</span> |
| `elections.noPositions` | No positions yet. | <span dir="rtl">لا توجد مناصب انتخابية بعد.</span> |
| `elections.seats` | Seats | <span dir="rtl">المقاعد</span> |
| `elections.seatCount` | {seats} seat(s) | <span dir="rtl">{seats} مقعد</span> |
| `elections.addPosition` | Add position | <span dir="rtl">إضافة منصب انتخابي</span> |
| `elections.removePosition` | Remove the {role} position | <span dir="rtl">إزالة منصب {role}</span> |
| `elections.candidate` | Candidate | <span dir="rtl">المرشح</span> |
| `elections.chooseCandidate` | Choose a candidate | <span dir="rtl">اختر مرشحًا</span> |
| `elections.someoneNew` | Someone new | <span dir="rtl">شخص جديد</span> |
| `elections.addCandidate` | Add candidate | <span dir="rtl">إضافة مرشح</span> |
| `elections.removeCandidate` | Remove {name} | <span dir="rtl">إزالة {name}</span> |
| `elections.votes` | {votes} votes | <span dir="rtl">{votes} صوتًا</span> |
| `elections.votesFor` | Votes for {name} | <span dir="rtl">أصوات {name}</span> |
| `elections.elected` | Elected | <span dir="rtl">فائز</span> |
| `elections.results` | Results | <span dir="rtl">النتائج</span> |
| `elections.saveResults` | Save results | <span dir="rtl">حفظ النتائج</span> |
| `elections.confirmExplanation` | Confirming ends the outgoing terms and starts the elected officers’ terms on the date below. It cannot be undone. | <span dir="rtl">يؤدي الاعتماد إلى إنهاء فترات العضوية المنتهية وبدء فترات الفائزين في التاريخ أدناه. ولا يمكن التراجع عنه.</span> |
| `elections.confirmChecked` | I have checked the results. | <span dir="rtl">راجعتُ النتائج.</span> |
| `elections.termsStartDate` | New terms start on | <span dir="rtl">تبدأ فترات العضوية الجديدة في</span> |
| `elections.confirm` | Confirm results | <span dir="rtl">اعتماد النتائج</span> |
| `elections.refusals.elections.confirmed-is-locked` | This election is confirmed and locked. | <span dir="rtl">هذه الانتخابات معتمدة ومقفلة.</span> |
| `elections.refusals.elections.corrects-must-be-confirmed-of-unit` | A correction must refer to a confirmed election of this unit. | <span dir="rtl">يجب أن يشير التصحيح إلى انتخابات معتمدة لهذه الوحدة.</span> |
| `elections.refusals.elections.start-before-election` | New terms cannot start before the election. | <span dir="rtl">لا يمكن أن تبدأ فترات العضوية الجديدة قبل الانتخابات.</span> |
| `elections.refusals.elections.no-positions` | Add at least one position first. | <span dir="rtl">أضف منصبًا انتخابيًا واحدًا على الأقل أولًا.</span> |
| `elections.refusals.elections.results-incomplete` | Record the votes of every candidate first. | <span dir="rtl">سجّل أصوات كل المرشحين أولًا.</span> |
| `elections.refusals.elections.seats-not-filled` | Each position needs exactly as many elected candidates as it has seats. | <span dir="rtl">يجب أن يكون عدد الفائزين في كل منصب مساويًا تمامًا لعدد مقاعده.</span> |
| `elections.refusals.elections.already-a-candidate` | This person is already a candidate for this position. | <span dir="rtl">هذا الشخص مرشح لهذا المنصب بالفعل.</span> |
| `elections.refusals.elections.position-not-found` | This position no longer exists. | <span dir="rtl">لم يعد هذا المنصب الانتخابي موجودًا.</span> |
| `elections.refusals.elections.candidate-not-found` | This candidate no longer exists. | <span dir="rtl">لم يعد هذا المرشح موجودًا.</span> |
| `elections.refusals.elections.not-found` | This election no longer exists. | <span dir="rtl">لم تعد هذه الانتخابات موجودة.</span> |
| `elections.refusals.roles.not-found` | This role cannot be used in this unit. | <span dir="rtl">لا يمكن استخدام هذا الدور في هذه الوحدة.</span> |
| `elections.refusals.branches.inactive` | This branch is inactive, so its register is read-only. | <span dir="rtl">هذا الفرع غير نشط، لذا سجله للقراءة فقط.</span> |
| `elections.refusals.setting.not-configured` | This waits for the data administrator: the language new officers start with is not set. | <span dir="rtl">ينتظر هذا مسؤول البيانات: لم تُضبط اللغة التي يبدأ بها أعضاء اللجان الجدد.</span> |
| `elections.refusals.request.invalid` | Check the fields and try again. | <span dir="rtl">تحقّق من الحقول وحاول مرة أخرى.</span> |
| `handovers.mine` | Handovers you take part in | <span dir="rtl">عمليات التسليم التي تشارك فيها</span> |
| `handovers.noHandovers` | No handovers. | <span dir="rtl">لا توجد عمليات تسليم.</span> |
| `handovers.summary` | {role}: {outgoing} to {incoming} | <span dir="rtl">{role}: من {outgoing} إلى {incoming}</span> |
| `handovers.statuses.open` | Open | <span dir="rtl">مفتوحة</span> |
| `handovers.statuses.confirming` | Being confirmed | <span dir="rtl">قيد التأكيد</span> |
| `handovers.statuses.complete` | Complete | <span dir="rtl">مكتملة</span> |
| `handovers.setUpHeading` | Set up a handover | <span dir="rtl">إعداد عملية تسليم</span> |
| `handovers.outgoing` | Outgoing officer | <span dir="rtl">عضو اللجنة المغادر</span> |
| `handovers.incoming` | Incoming officer | <span dir="rtl">عضو اللجنة القادم</span> |
| `handovers.choosePerson` | Choose an officer | <span dir="rtl">اختر عضو لجنة</span> |
| `handovers.setUp` | Set up handover | <span dir="rtl">إعداد عملية التسليم</span> |
| `handovers.confirmedBy` | {name} confirmed on {date} | <span dir="rtl">أكّد {name} في {date}</span> |
| `handovers.notYetConfirmed` | {name} has not confirmed yet | <span dir="rtl">لم يؤكّد {name} بعد</span> |
| `handovers.checklist` | Checklist | <span dir="rtl">قائمة التسليم</span> |
| `handovers.noItems` | The checklist is empty. | <span dir="rtl">قائمة التسليم فارغة.</span> |
| `handovers.removeItem` | Remove {name} | <span dir="rtl">إزالة {name}</span> |
| `handovers.addItem` | Add item | <span dir="rtl">إضافة عنصر</span> |
| `handovers.confirmExplanation` | Confirm the whole handover once you are satisfied. The first confirmation fixes the checklist; when both officers have confirmed, the handover is complete and locked. | <span dir="rtl">أكّد عملية التسليم كاملة متى اطمأننت إليها. يثبّت التأكيد الأول القائمة، وعندما يؤكّد العضوان تكتمل العملية وتُقفل.</span> |
| `handovers.confirmChecked` | I have checked the checklist. | <span dir="rtl">راجعتُ قائمة التسليم.</span> |
| `handovers.confirm` | Confirm handover | <span dir="rtl">تأكيد عملية التسليم</span> |
| `handovers.refusals.handovers.checklist-fixed` | Confirmation has started, so the checklist can no longer change. | <span dir="rtl">بدأ التأكيد، لذا لم يعد بالإمكان تغيير القائمة.</span> |
| `handovers.refusals.handovers.already-confirmed` | You have already confirmed this handover. | <span dir="rtl">لقد أكّدت عملية التسليم هذه بالفعل.</span> |
| `handovers.refusals.handovers.not-a-participant` | Only the two officers named on a handover can confirm it. | <span dir="rtl">لا يؤكّد عملية التسليم إلا العضوان المذكوران فيها.</span> |
| `handovers.refusals.handovers.same-person` | The outgoing and incoming officers must be different people. | <span dir="rtl">يجب أن يكون العضو المغادر والعضو القادم شخصين مختلفين.</span> |
| `handovers.refusals.handovers.not-officers-of-unit` | Both officers must hold, or have held, a term in this unit. | <span dir="rtl">يجب أن يشغل العضوان، أو أن يكونا قد شغلا، فترة عضوية في هذه الوحدة.</span> |
| `handovers.refusals.handovers.item-not-found` | This item no longer exists. | <span dir="rtl">لم يعد هذا العنصر موجودًا.</span> |
| `handovers.refusals.handovers.not-found` | This handover no longer exists. | <span dir="rtl">لم تعد عملية التسليم هذه موجودة.</span> |
| `handovers.refusals.roles.not-found` | This role cannot be used in this unit. | <span dir="rtl">لا يمكن استخدام هذا الدور في هذه الوحدة.</span> |
| `handovers.refusals.branches.inactive` | This branch is inactive, so its register is read-only. | <span dir="rtl">هذا الفرع غير نشط، لذا سجله للقراءة فقط.</span> |
| `handovers.refusals.request.invalid` | Check the fields and try again. | <span dir="rtl">تحقّق من الحقول وحاول مرة أخرى.</span> |

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
| `capabilities.documents-archive.documents.read` | Read the archive | <span dir="rtl">الاطلاع على الأرشيف</span> |
| `capabilities.documents-archive.documents.upload` | Upload to the archive | <span dir="rtl">الرفع إلى الأرشيف</span> |

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
| `screens.service-settings` | Service settings | <span dir="rtl">إعدادات الخدمات</span> |
| `screens.service-switches` | Service switches | <span dir="rtl">تشغيل الخدمات</span> |
| `screens.notifications` | Notifications | <span dir="rtl">التنبيهات</span> |
| `screens.texts` | Texts | <span dir="rtl">النصوص</span> |
| `screens.branding` | Branding and letterhead | <span dir="rtl">الهوية والترويسة</span> |
| `capabilities.administration-panel.system-administrators.manage` | Appoint and remove system administrators | <span dir="rtl">تعيين مسؤولي النظام وإعفاؤهم</span> |
| `capabilities.administration-panel.officer-accounts.manage` | Manage officer accounts | <span dir="rtl">إدارة حسابات أعضاء اللجان</span> |
| `capabilities.administration-panel.permissions-matrix.manage` | Edit the permissions matrix | <span dir="rtl">تعديل مصفوفة الصلاحيات</span> |
| `capabilities.administration-panel.access-check.read` | Use the access check | <span dir="rtl">استخدام فحص الصلاحيات</span> |
| `capabilities.administration-panel.role-designations.manage` | Designate the register officer roles | <span dir="rtl">تحديد أدوار مسؤولي السجل</span> |
| `capabilities.administration-panel.lists.manage` | Manage lists | <span dir="rtl">إدارة القوائم</span> |
| `capabilities.administration-panel.service-settings.manage` | Manage service settings | <span dir="rtl">إدارة إعدادات الخدمات</span> |
| `capabilities.administration-panel.service-switches.manage` | Switch services on and off | <span dir="rtl">تشغيل الخدمات وإيقافها</span> |
| `capabilities.administration-panel.notifications.manage` | Set notification defaults | <span dir="rtl">ضبط إعدادات التنبيهات الافتراضية</span> |
| `capabilities.administration-panel.texts.manage` | Write the texts | <span dir="rtl">كتابة النصوص</span> |
| `capabilities.administration-panel.branding.manage` | Set the branding and letterhead | <span dir="rtl">ضبط الهوية والترويسة</span> |
| `capabilities.administration-panel.setup-checklist.manage` | Set required settings from the set-up checklist | <span dir="rtl">ضبط الإعدادات المطلوبة من قائمة الإعداد</span> |
| `capabilities.administration-panel.setup-checklist.read` | See the set-up checklist | <span dir="rtl">عرض قائمة الإعداد</span> |
| `settings.administration-panel.logo_file` | Logo | <span dir="rtl">الشعار</span> |
| `settings.administration-panel.small_icon_file` | Square icon (192 pixels) | <span dir="rtl">الأيقونة المربعة (192 بكسل)</span> |
| `settings.administration-panel.large_icon_file` | Square icon (512 pixels) | <span dir="rtl">الأيقونة المربعة (512 بكسل)</span> |
| `settings.administration-panel.latin_font_file` | Latin font | <span dir="rtl">الخط اللاتيني</span> |
| `settings.administration-panel.arabic_font_file` | Arabic font | <span dir="rtl">الخط العربي</span> |
| `settings.administration-panel.logo_position` | Logo position | <span dir="rtl">موضع الشعار</span> |
| `settings.administration-panel.file_types_receipt_photos` | Allowed file types: receipt photos | <span dir="rtl">أنواع الملفات المسموح بها: صور الإيصالات</span> |
| `settings.administration-panel.file_size_limit_receipt_photos_mb` | Size limit (MB): receipt photos | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): صور الإيصالات</span> |
| `settings.administration-panel.file_types_documents` | Allowed file types: documents | <span dir="rtl">أنواع الملفات المسموح بها: المستندات</span> |
| `settings.administration-panel.file_size_limit_documents_mb` | Size limit (MB): documents | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): المستندات</span> |
| `settings.administration-panel.file_types_letter_scans` | Allowed file types: letter scans | <span dir="rtl">أنواع الملفات المسموح بها: الخطابات الممسوحة ضوئيًا</span> |
| `settings.administration-panel.file_size_limit_letter_scans_mb` | Size limit (MB): letter scans | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): الخطابات الممسوحة ضوئيًا</span> |
| `settings.administration-panel.file_types_media_images` | Allowed file types: media images | <span dir="rtl">أنواع الملفات المسموح بها: صور الوسائط</span> |
| `settings.administration-panel.file_size_limit_media_images_mb` | Size limit (MB): media images | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): صور الوسائط</span> |
| `settings.administration-panel.file_types_video` | Allowed file types: video | <span dir="rtl">أنواع الملفات المسموح بها: الفيديو</span> |
| `settings.administration-panel.file_size_limit_video_mb` | Size limit (MB): video | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): الفيديو</span> |
| `settings.administration-panel.file_types_branding_images` | Allowed file types: branding images | <span dir="rtl">أنواع الملفات المسموح بها: صور الهوية</span> |
| `settings.administration-panel.file_size_limit_branding_images_mb` | Size limit (MB): branding images | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): صور الهوية</span> |
| `settings.administration-panel.file_types_fonts` | Allowed file types: fonts | <span dir="rtl">أنواع الملفات المسموح بها: الخطوط</span> |
| `settings.administration-panel.file_size_limit_fonts_mb` | Size limit (MB): fonts | <span dir="rtl">الحد الأقصى للحجم (ميغابايت): الخطوط</span> |
| `settings.administration-panel.download_link_threshold_mb` | Download link size (MB) | <span dir="rtl">حجم رابط التنزيل (ميغابايت)</span> |
| `settings.administration-panel.download_link_lifetime_minutes` | Download link lifetime (minutes) | <span dir="rtl">مدة صلاحية رابط التنزيل (بالدقائق)</span> |
| `settings.administration-panel.max_image_dimension_px` | Maximum image dimension (pixels) | <span dir="rtl">أقصى بُعد للصورة (بالبكسل)</span> |
| `settings.administration-panel.orphan_file_age_days` | Orphan file age (days) | <span dir="rtl">عمر الملف اليتيم (بالأيام)</span> |
| `settings.administration-panel.organisation_name` | Organisation name | <span dir="rtl">اسم المنظمة</span> |
| `settings.administration-panel.main_colour` | Main colour | <span dir="rtl">اللون الرئيسي</span> |
| `settings.administration-panel.accent_colour` | Accent colour | <span dir="rtl">لون التمييز</span> |
| `settings.administration-panel.new_officer_language` | Language new officers start with | <span dir="rtl">اللغة التي يبدأ بها أعضاء اللجان الجدد</span> |
| `settings.administration-panel.arabic_digits` | Digits on Arabic screens | <span dir="rtl">الأرقام في الشاشات العربية</span> |
| `fileTypes.image/jpeg` | JPEG image | <span dir="rtl">صورة JPEG</span> |
| `fileTypes.image/png` | PNG image | <span dir="rtl">صورة PNG</span> |
| `fileTypes.image/webp` | WebP image | <span dir="rtl">صورة WebP</span> |
| `fileTypes.application/pdf` | PDF | <span dir="rtl">PDF</span> |
| `fileTypes.application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Word document (.docx) | <span dir="rtl">مستند Word (.docx)</span> |
| `fileTypes.application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | Excel workbook (.xlsx) | <span dir="rtl">مصنف Excel (.xlsx)</span> |
| `fileTypes.video/mp4` | MP4 video | <span dir="rtl">فيديو MP4</span> |
| `fileTypes.font/woff2` | WOFF2 font | <span dir="rtl">خط WOFF2</span> |
| `fileTypes.font/ttf` | TrueType font | <span dir="rtl">خط TrueType</span> |
| `fileTypes.font/otf` | OpenType font | <span dir="rtl">خط OpenType</span> |
| `settingOptions.communication-hub.alert_types_for_new_officers.notices` | New notices | <span dir="rtl">الإعلانات الجديدة</span> |
| `settingOptions.communication-hub.alert_types_for_new_officers.votes` | Votes | <span dir="rtl">التصويتات</span> |
| `settingOptions.communication-hub.alert_types_for_new_officers.replies` | Replies | <span dir="rtl">الردود</span> |
| `settingOptions.communication-hub.alert_types_for_new_officers.requests` | Requests | <span dir="rtl">الطلبات</span> |
| `settingOptions.administration-panel.new_officer_language.en` | English | <span dir="rtl">الإنجليزية</span> |
| `settingOptions.administration-panel.new_officer_language.ar` | Arabic | <span dir="rtl">العربية</span> |
| `settingOptions.administration-panel.arabic_digits.western` | Western digits (0-9) | <span dir="rtl">الأرقام الغربية (0-9)</span> |
| `settingOptions.administration-panel.arabic_digits.arabic-indic` | Arabic-Indic digits (٠-٩) | <span dir="rtl">الأرقام العربية الهندية (٠-٩)</span> |
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
| `officerAccounts.intro` | Every person in the register, with their access state. | <span dir="rtl">كل شخص في السجل مع حالة وصوله.</span> |
| `officerAccounts.registerLink` | Register details are edited in the Committee register. | <span dir="rtl">تُعدَّل بيانات السجل في سجلّ اللجان.</span> |
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
| `units.letterheadAddressEn` | Letterhead address in English | <span dir="rtl">عنوان الترويسة بالإنجليزية</span> |
| `units.letterheadAddressAr` | Letterhead address in Arabic | <span dir="rtl">عنوان الترويسة بالعربية</span> |
| `units.calendarColour` | Calendar colour | <span dir="rtl">لون التقويم</span> |
| `units.noCalendarColour` | No colour chosen | <span dir="rtl">لم يُختر لون</span> |
| `units.retiredCalendarColour` | Its current colour (no longer offered) | <span dir="rtl">لونها الحالي (لم يعد معروضًا)</span> |
| `units.colourInUse` | used by another unit | <span dir="rtl">تستخدمه وحدة أخرى</span> |
| `units.noColourFree` | Every calendar colour is already used by another unit. Add another colour on the Lists screen, or ask whoever manages the lists. | <span dir="rtl">كل ألوان التقويم مستخدمة من وحدات أخرى. أضف لونًا آخر من صفحة القوائم، أو اطلب ذلك ممن يدير القوائم.</span> |
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
| `units.refusals.branches.calendar-colour-not-offered` | This colour is no longer offered. Choose another. | <span dir="rtl">لم يعد هذا اللون معروضًا. اختر لونًا آخر.</span> |
| `units.refusals.branches.calendar-colour-taken` | Another unit already uses this colour. Choose another, or add another colour on the Lists screen. | <span dir="rtl">تستخدم وحدة أخرى هذا اللون. اختر لونًا آخر، أو أضف لونًا آخر من صفحة القوائم.</span> |
| `units.refusals.request.invalid` | Check the fields: every one is required, and the code uses only letters, digits and hyphens. | <span dir="rtl">تحقّق من الحقول: كلها مطلوبة، والرمز يتكوّن من حروف وأرقام وشرطات فقط.</span> |
| `roles.standardRoles` | Standard roles | <span dir="rtl">الأدوار القياسية</span> |
| `roles.standardRolesIntro` | The national list of roles used by every branch, so the same role means the same thing everywhere. Only the national register officer maintains it. | <span dir="rtl">القائمة الوطنية للأدوار التي تستخدمها كل الفروع، ليكون للدور المعنى نفسه في كل مكان. مسؤول السجل الوطني وحده يتولّى صيانتها.</span> |
| `roles.noRoles` | No standard roles yet. | <span dir="rtl">لا توجد أدوار قياسية بعد.</span> |
| `roles.addRole` | Add a standard role | <span dir="rtl">إضافة دور قياسي</span> |
| `roles.add` | Add role | <span dir="rtl">إضافة الدور</span> |
| `roles.branchRolesAllowed` | May branches add roles of their own? | <span dir="rtl">هل يُسمح للفروع بإضافة أدوار خاصة بها؟</span> |
| `roles.branchRolesNotSet` | Not set yet: branches cannot add roles until you choose. | <span dir="rtl">لم يُضبط بعد: لا تستطيع الفروع إضافة أدوار حتى تختار.</span> |
| `roles.branchRolesYes` | Yes, branches may add roles of their own | <span dir="rtl">نعم، يُسمح للفروع بإضافة أدوار خاصة بها</span> |
| `roles.branchRolesNo` | No, branches use the standard roles only | <span dir="rtl">لا، تستخدم الفروع الأدوار القياسية فقط</span> |
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
| `lists.names.calendar-colours` | Calendar colours | <span dir="rtl">ألوان التقويم</span> |
| `lists.colour` | Colour | <span dir="rtl">اللون</span> |
| `lists.retired` | Retired | <span dir="rtl">متوقف</span> |
| `lists.save` | Save | <span dir="rtl">حفظ</span> |
| `lists.cancel` | Cancel | <span dir="rtl">إلغاء</span> |
| `lists.rename` | Rename | <span dir="rtl">إعادة التسمية</span> |
| `lists.renameItem` | Rename {name} | <span dir="rtl">إعادة تسمية {name}</span> |
| `lists.retire` | Retire | <span dir="rtl">إيقاف</span> |
| `lists.retireItem` | Retire {name} | <span dir="rtl">إيقاف {name}</span> |
| `lists.retireWarning` | It will no longer be offered for new records, and past records keep it. You can bring it back later. | <span dir="rtl">لن يُعرض بعد الآن للسجلات الجديدة، وتحتفظ به السجلات السابقة. يمكنك إعادته لاحقًا.</span> |
| `lists.restore` | Bring back | <span dir="rtl">إعادة</span> |
| `lists.restoreItem` | Bring back {name} | <span dir="rtl">إعادة {name}</span> |
| `lists.confirmRetire` | Retire {name} | <span dir="rtl">إيقاف {name}</span> |
| `lists.empty` | No items yet. | <span dir="rtl">لا توجد عناصر بعد.</span> |
| `lists.add` | Add item | <span dir="rtl">إضافة عنصر</span> |
| `lists.archiveCategories` | Archive categories | <span dir="rtl">فئات الأرشيف</span> |
| `lists.archiveCategoriesFixed` | These categories are fixed by the portal and cannot be changed. | <span dir="rtl">هذه الفئات ثابتة تحددها البوابة ولا يمكن تغييرها.</span> |
| `lists.refusals.lists.name-taken` | Another item in this list already has this name. | <span dir="rtl">يوجد عنصر آخر في هذه القائمة بهذا الاسم.</span> |
| `lists.refusals.lists.item-not-found` | This item no longer exists. | <span dir="rtl">لم يعد هذا العنصر موجودًا.</span> |
| `lists.refusals.lists.item-already-retired` | This item is already retired. | <span dir="rtl">هذا العنصر متوقف بالفعل.</span> |
| `lists.refusals.lists.item-not-retired` | This item is not retired. | <span dir="rtl">هذا العنصر غير متوقف.</span> |
| `lists.refusals.lists.order-must-name-every-item` | The list changed meanwhile. It has been reloaded; try again. | <span dir="rtl">تغيّرت القائمة في هذه الأثناء. أُعيد تحميلها؛ حاول مرة أخرى.</span> |
| `lists.refusals.lists.colour-required` | A calendar colour needs its colour. | <span dir="rtl">يحتاج لون التقويم إلى لونه.</span> |
| `lists.refusals.lists.colour-only-for-calendar-colours` | Only a calendar colour has a colour. | <span dir="rtl">لا يكون اللون إلا للون التقويم.</span> |
| `lists.refusals.request.invalid` | Both names are required, and a colour is written #RRGGBB. | <span dir="rtl">الاسمان مطلوبان، ويُكتب اللون بالصيغة #RRGGBB.</span> |
| `setupChecklist.intro` | Everything required that is not yet configured, by service. A service cannot be switched on for a unit until its checklist is complete. | <span dir="rtl">كل ما هو مطلوب ولم يُضبط بعد، حسب الخدمة. لا يمكن تشغيل خدمة لوحدة ما حتى تكتمل قائمتها.</span> |
| `setupChecklist.complete` | Nothing is waiting: everything required is configured. | <span dir="rtl">لا شيء بانتظار الإعداد: كل ما هو مطلوب مضبوط.</span> |
| `setupChecklist.privacyNotice` | Set the privacy notice. It is required before anything else. | <span dir="rtl">اضبط إشعار الخصوصية. وهو مطلوب قبل أي شيء آخر.</span> |
| `setupChecklist.designation` | Designate a standard role as {designation}. | <span dir="rtl">عيّن دورًا قياسيًا بصفة {designation}.</span> |
| `setupChecklist.setting` | Set "{setting}". | <span dir="rtl">اضبط «{setting}».</span> |
| `setupChecklist.text` | Write the {text}. | <span dir="rtl">اكتب {text}.</span> |
| `setupChecklist.refusals.setup-checklist.already-set` | This setting has already been set. It is changed on Service settings. | <span dir="rtl">ضُبط هذا الإعداد بالفعل. يُغيَّر من صفحة إعدادات الخدمات.</span> |
| `setupChecklist.refusals.setup-checklist.not-a-required-setting` | This is not a required setting. | <span dir="rtl">هذا ليس إعدادًا مطلوبًا.</span> |
| `setupChecklist.refusals.request.invalid` | This value is not allowed for this setting. | <span dir="rtl">هذه القيمة غير مسموح بها لهذا الإعداد.</span> |
| `serviceSettings.intro` | Every setting, by service. A setting has no value until one is entered here; until then, what depends on it waits. Every change is kept and can be restored. | <span dir="rtl">كل الإعدادات، حسب الخدمة. لا قيمة لأي إعداد حتى تُدخَل هنا، وحتى ذلك الحين ينتظر ما يعتمد عليه. يُحفظ كل تغيير ويمكن استعادته.</span> |
| `serviceSettings.required` | Required | <span dir="rtl">مطلوب</span> |
| `serviceSettings.notConfigured` | Not set | <span dir="rtl">غير مضبوط</span> |
| `serviceSettings.none` | None | <span dir="rtl">لا شيء</span> |
| `serviceSettings.yes` | Yes | <span dir="rtl">نعم</span> |
| `serviceSettings.no` | No | <span dir="rtl">لا</span> |
| `serviceSettings.choose` | Choose | <span dir="rtl">اختر</span> |
| `serviceSettings.save` | Save | <span dir="rtl">حفظ</span> |
| `serviceSettings.cancel` | Cancel | <span dir="rtl">إلغاء</span> |
| `serviceSettings.change` | Change | <span dir="rtl">تغيير</span> |
| `serviceSettings.changeSetting` | Change {setting} | <span dir="rtl">تغيير {setting}</span> |
| `serviceSettings.cannotEnterHere` | This setting cannot be entered on screen. | <span dir="rtl">لا يمكن إدخال هذا الإعداد من الشاشة.</span> |
| `serviceSettings.setOnBranding` | Set on the Branding and letterhead screen. | <span dir="rtl">يُضبط من صفحة الهوية والترويسة.</span> |
| `serviceSettings.portalWide` | Portal-wide | <span dir="rtl">على مستوى البوابة</span> |
| `serviceSettings.overrides` | Unit overrides | <span dir="rtl">قيم الوحدات الخاصة</span> |
| `serviceSettings.noOverrides` | No unit has its own value. | <span dir="rtl">لا توجد وحدة لها قيمة خاصة.</span> |
| `serviceSettings.unit` | Unit | <span dir="rtl">الوحدة</span> |
| `serviceSettings.chooseUnit` | Choose a unit | <span dir="rtl">اختر وحدة</span> |
| `serviceSettings.addOverride` | Give a unit its own value | <span dir="rtl">إعطاء وحدة قيمة خاصة بها</span> |
| `serviceSettings.removeOverride` | Remove the override for {unit} | <span dir="rtl">إزالة القيمة الخاصة بـ {unit}</span> |
| `serviceSettings.history` | History | <span dir="rtl">السجل</span> |
| `serviceSettings.showHistory` | Show history of {setting} | <span dir="rtl">عرض سجل {setting}</span> |
| `serviceSettings.noHistory` | No changes yet. | <span dir="rtl">لا توجد تغييرات بعد.</span> |
| `serviceSettings.historyEntry` | {date}, {scope}, by {name}: {value} | <span dir="rtl">{date}، {scope}، بواسطة {name}: {value}</span> |
| `serviceSettings.overrideRemoved` | override removed | <span dir="rtl">أُزيلت القيمة الخاصة</span> |
| `serviceSettings.restore` | Restore this value | <span dir="rtl">استعادة هذه القيمة</span> |
| `serviceSettings.refusals.service-settings.not-registered` | This setting no longer exists. | <span dir="rtl">لم يعد هذا الإعداد موجودًا.</span> |
| `serviceSettings.refusals.service-settings.no-unit-override` | This setting has one value for the whole portal. | <span dir="rtl">لهذا الإعداد قيمة واحدة للبوابة كلها.</span> |
| `serviceSettings.refusals.service-settings.no-override` | This unit has no value of its own. | <span dir="rtl">ليس لهذه الوحدة قيمة خاصة بها.</span> |
| `serviceSettings.refusals.service-settings.history-not-found` | This change no longer exists. | <span dir="rtl">لم يعد هذا التغيير موجودًا.</span> |
| `serviceSettings.refusals.branches.not-found` | This unit no longer exists. | <span dir="rtl">لم تعد هذه الوحدة موجودة.</span> |
| `serviceSettings.refusals.request.invalid` | This value is not allowed for this setting. | <span dir="rtl">هذه القيمة غير مسموح بها لهذا الإعداد.</span> |
| `serviceSwitches.intro` | Turn each service on or off for the whole portal, or give a unit its own on or off. A service switched off is hidden and its data is kept. A service can be switched on only once its set-up is complete. | <span dir="rtl">شغّل كل خدمة أو أوقفها للبوابة كلها، أو أعطِ وحدة حالة خاصة بها. الخدمة الموقوفة تُخفى وتُحفظ بياناتها. لا تُشغَّل خدمة إلا بعد اكتمال إعدادها.</span> |
| `serviceSwitches.portalWide` | Portal-wide | <span dir="rtl">على مستوى البوابة</span> |
| `serviceSwitches.portalWideOf` | {service}, portal-wide | <span dir="rtl">{service}، على مستوى البوابة</span> |
| `serviceSwitches.unitOf` | {service} for {unit} | <span dir="rtl">{service} لـ {unit}</span> |
| `serviceSwitches.addUnit` | Give a unit its own on or off | <span dir="rtl">إعطاء وحدة حالة خاصة بها</span> |
| `serviceSwitches.addUnitOf` | Give a unit its own on or off for {service} | <span dir="rtl">إعطاء وحدة حالة خاصة بها لـ {service}</span> |
| `serviceSwitches.chooseUnit` | Choose a unit | <span dir="rtl">اختر وحدة</span> |
| `serviceSwitches.on` | On | <span dir="rtl">تعمل</span> |
| `serviceSwitches.off` | Off | <span dir="rtl">موقوفة</span> |
| `serviceSwitches.follow` | Follow portal-wide | <span dir="rtl">كما هي على مستوى البوابة</span> |
| `serviceSwitches.alwaysOn` | Always on: this service cannot be switched off. | <span dir="rtl">تعمل دائمًا: لا يمكن إيقاف هذه الخدمة.</span> |
| `serviceSwitches.needs` | Needs: {services} | <span dir="rtl">تحتاج إلى: {services}</span> |
| `serviceSwitches.refusals.service-switches.needs-service` | This service needs another that is off there. Switch that one on first. | <span dir="rtl">تحتاج هذه الخدمة إلى خدمة أخرى موقوفة هناك. شغّلها أولًا.</span> |
| `serviceSwitches.refusals.service-switches.needed-by-service` | Another service that is on there needs this one. Switch that one off first. | <span dir="rtl">تحتاج خدمة أخرى تعمل هناك إلى هذه الخدمة. أوقف تلك أولًا.</span> |
| `serviceSwitches.refusals.service-switches.setup-incomplete` | Its set-up is not complete there: see the set-up checklist. | <span dir="rtl">لم يكتمل إعدادها هناك: راجع قائمة الإعداد.</span> |
| `serviceSwitches.refusals.service-switches.always-on` | This service cannot be switched off. | <span dir="rtl">لا يمكن إيقاف هذه الخدمة.</span> |
| `serviceSwitches.refusals.service-switches.portal-wide-cannot-be-cleared` | The portal-wide value is either on or off. | <span dir="rtl">الحالة على مستوى البوابة إما تعمل أو موقوفة.</span> |
| `serviceSwitches.refusals.service-switches.no-such-service` | There is no such service. | <span dir="rtl">لا توجد خدمة بهذا الاسم.</span> |
| `serviceSwitches.refusals.branches.not-found` | This unit no longer exists. | <span dir="rtl">لم تعد هذه الوحدة موجودة.</span> |
| `notifications.alertTypes` | Alerts for new officers | <span dir="rtl">التنبيهات لأعضاء اللجان الجدد</span> |
| `notifications.alertTypesIntro` | The alerts a new officer starts with. Each officer can change their own later. National circulars always notify. | <span dir="rtl">التنبيهات التي يبدأ بها عضو اللجنة الجديد. يمكن لكل عضو تغيير تنبيهاته لاحقًا. تصل التعاميم الوطنية دائمًا.</span> |
| `notifications.notSetYet` | Not set yet: nothing is ticked until you save. | <span dir="rtl">لم تُضبط بعد: لا يُحدَّد شيء حتى تحفظ.</span> |
| `notifications.alwaysOn` | always on | <span dir="rtl">مفعّل دائمًا</span> |
| `notifications.installGuide` | iPhone install guide | <span dir="rtl">دليل التثبيت على آيفون</span> |
| `notifications.installGuideIntro` | Shown to officers on iPhone: alerts reach an iPhone only once the portal is added to its home screen. | <span dir="rtl">يُعرض لأعضاء اللجان على آيفون: لا تصل التنبيهات إلى آيفون إلا بعد إضافة البوابة إلى الشاشة الرئيسية.</span> |
| `notifications.save` | Save | <span dir="rtl">حفظ</span> |
| `notifications.refusals.request.invalid` | Check what you entered: the English text is needed. | <span dir="rtl">تحقّق مما أدخلته: النص الإنجليزي مطلوب.</span> |
| `adminTexts.english` | In English | <span dir="rtl">بالإنجليزية</span> |
| `adminTexts.arabic` | In Arabic | <span dir="rtl">بالعربية</span> |
| `adminTexts.arabicMissing` | The Arabic is not written yet. Until it is, officers reading Arabic see the English. | <span dir="rtl">لم يُكتب النص العربي بعد. وحتى يُكتب، يرى من يقرأ بالعربية النص الإنجليزي.</span> |
| `adminTexts.save` | Save | <span dir="rtl">حفظ</span> |
| `adminTexts.names.iphone-install-guide` | iPhone install guide | <span dir="rtl">دليل التثبيت على آيفون</span> |
| `adminTexts.names.access-not-active` | "access not active" message | <span dir="rtl">رسالة «الوصول غير نشط»</span> |
| `adminTexts.names.help` | help text | <span dir="rtl">نص المساعدة</span> |
| `texts.privacyNotice` | Privacy notice | <span dir="rtl">إشعار الخصوصية</span> |
| `texts.privacyNoticeIntro` | Shown to every officer at first sign-in and from the footer. Each change is published as a new version, and every officer reads it again the next time they open the portal. Earlier versions are kept. | <span dir="rtl">يُعرض لكل عضو لجنة عند أول تسجيل دخول ومن تذييل الصفحة. يُنشر كل تغيير إصدارًا جديدًا، ويقرؤه كل عضو من جديد في المرة التالية التي يفتح فيها البوابة. تُحفظ الإصدارات السابقة.</span> |
| `texts.noNotice` | No privacy notice yet. Until one is published, nobody can use the portal beyond the "access not active" page. | <span dir="rtl">لا يوجد إشعار خصوصية بعد. وحتى يُنشر، لا يستطيع أحد استخدام البوابة بعد صفحة «الوصول غير نشط».</span> |
| `texts.versionOn` | Version of {date} | <span dir="rtl">إصدار {date}</span> |
| `texts.current` | current | <span dir="rtl">الحالي</span> |
| `texts.arabicMissing` | Arabic not written | <span dir="rtl">النص العربي غير مكتوب</span> |
| `texts.publish` | Publish as the new version | <span dir="rtl">النشر إصدارًا جديدًا</span> |
| `texts.publishConfirm` | I understand every officer, me included, will be asked to read it again. | <span dir="rtl">أفهم أن كل عضو، وأنا منهم، سيُطلب منه قراءته من جديد.</span> |
| `texts.accessNotActive` | "Access not active" message | <span dir="rtl">رسالة «الوصول غير نشط»</span> |
| `texts.accessNotActiveIntro` | Shown to anyone signed in whose access is not active: no current term, or no privacy notice yet. | <span dir="rtl">تُعرض لكل من سجّل الدخول ووصوله غير نشط: لا فترة عضوية حالية، أو لا إشعار خصوصية بعد.</span> |
| `texts.help` | Help | <span dir="rtl">المساعدة</span> |
| `texts.helpIntro` | Shown on the Help page, linked from the footer. | <span dir="rtl">تُعرض في صفحة المساعدة، المرتبطة من تذييل الصفحة.</span> |
| `texts.refusals.request.invalid` | The English text is needed. | <span dir="rtl">النص الإنجليزي مطلوب.</span> |
| `branding.intro` | The organisation name, and the main and accent colours used for headings, rules and accents on the portal and in its documents. Text stays black on white. | <span dir="rtl">اسم المنظمة، واللونان الرئيسي ولون التمييز المستخدمان للعناوين والخطوط والتمييز في البوابة ومستنداتها. يبقى النص أسود على أبيض.</span> |
| `branding.nameEn` | Organisation name in English | <span dir="rtl">اسم المنظمة بالإنجليزية</span> |
| `branding.nameAr` | Organisation name in Arabic | <span dir="rtl">اسم المنظمة بالعربية</span> |
| `branding.mainColour` | Main colour | <span dir="rtl">اللون الرئيسي</span> |
| `branding.accentColour` | Accent colour | <span dir="rtl">لون التمييز</span> |
| `branding.sampleHeading` | Heading | <span dir="rtl">عنوان</span> |
| `branding.contrastOk` | {ratio}:1 against white: reads well | <span dir="rtl">{ratio}:1 مقابل الأبيض: مقروء</span> |
| `branding.contrastTooLow` | {ratio}:1 against white: too pale to read (needs 4.5:1) | <span dir="rtl">{ratio}:1 مقابل الأبيض: باهت جدًا للقراءة (يلزم 4.5:1)</span> |
| `branding.save` | Save | <span dir="rtl">حفظ</span> |
| `branding.files` | Files | <span dir="rtl">الملفات</span> |
| `branding.uploaded` | uploaded | <span dir="rtl">مرفوع</span> |
| `branding.notUploaded` | not uploaded yet | <span dir="rtl">لم يُرفع بعد</span> |
| `branding.logo` | Logo | <span dir="rtl">الشعار</span> |
| `branding.logoHint` | A PNG, as it should appear on the letterhead. | <span dir="rtl">ملف PNG كما يجب أن يظهر في الترويسة.</span> |
| `branding.icon` | Square icon | <span dir="rtl">الأيقونة المربعة</span> |
| `branding.iconHint` | A square PNG, at least 512 pixels. It becomes the icon on phones’ home screens. | <span dir="rtl">ملف PNG مربع، 512 بكسل على الأقل. يصبح أيقونة البوابة على الشاشة الرئيسية للهواتف.</span> |
| `branding.latinFont` | Latin font | <span dir="rtl">الخط اللاتيني</span> |
| `branding.arabicFont` | Arabic font | <span dir="rtl">الخط العربي</span> |
| `branding.fontHint` | A font file (.woff2, .ttf or .otf), used on the screens and in the documents. | <span dir="rtl">ملف خط (.woff2 أو .ttf أو .otf)، يُستخدم في الشاشات والمستندات.</span> |
| `branding.logoPosition` | Logo position on the letterhead | <span dir="rtl">موضع الشعار في الترويسة</span> |
| `branding.logoPositionHint` | In Arabic letters it is mirrored: left becomes the start of the line. | <span dir="rtl">في الخطابات العربية ينعكس الموضع: يصبح اليسار بداية السطر.</span> |
| `branding.positions.left` | Left | <span dir="rtl">يسار</span> |
| `branding.positions.centre` | Centre | <span dir="rtl">وسط</span> |
| `branding.positions.right` | Right | <span dir="rtl">يمين</span> |
| `branding.letterhead` | Letterhead | <span dir="rtl">الترويسة</span> |
| `branding.previewIn.en` | In English | <span dir="rtl">بالإنجليزية</span> |
| `branding.previewIn.ar` | In Arabic | <span dir="rtl">بالعربية</span> |
| `branding.previewPdf` | Preview PDF | <span dir="rtl">معاينة PDF</span> |
| `branding.sample.logo` | Logo | <span dir="rtl">الشعار</span> |
| `branding.sample.paragraphs` | Dear colleague,

This is how a letter from the portal looks on the letterhead.

With best wishes, | <span dir="rtl">الزميل العزيز،

هكذا يبدو خطاب صادر من البوابة على الترويسة.

مع أطيب التحيات،</span> |
| `branding.sample.signer.name` | The signing officer | <span dir="rtl">عضو اللجنة الموقِّع</span> |
| `branding.sample.signer.role` | Their role | <span dir="rtl">دوره</span> |
| `branding.sample.signer.unit` | Their unit | <span dir="rtl">وحدته</span> |
| `branding.refusals.pdf.not-available` | PDF previews are not available here. They work on the preview site. | <span dir="rtl">معاينات PDF غير متاحة هنا. تعمل في موقع المعاينة.</span> |
| `branding.refusals.branding.icon-not-square` | The icon must be a square image. | <span dir="rtl">يجب أن تكون الأيقونة صورة مربعة.</span> |
| `branding.refusals.files.type-not-allowed` | This file type is not allowed for it. See the file settings. | <span dir="rtl">نوع هذا الملف غير مسموح به هنا. راجع إعدادات الملفات.</span> |
| `branding.refusals.files.too-large` | This file is larger than its limit. See the file settings. | <span dir="rtl">هذا الملف أكبر من حده. راجع إعدادات الملفات.</span> |
| `branding.refusals.files.storage-not-configured` | File storage is not set up yet. | <span dir="rtl">لم يُجهَّز تخزين الملفات بعد.</span> |
| `branding.refusals.files.upload-failed` | The upload did not finish. Try again. | <span dir="rtl">لم يكتمل الرفع. حاول مرة أخرى.</span> |
| `branding.refusals.setting.not-configured` | This waits for its file settings to be set. | <span dir="rtl">ينتظر هذا ضبط إعدادات الملفات.</span> |
| `branding.refusals.branding.no-national-unit` | The General Council unit does not exist yet. | <span dir="rtl">وحدة المجلس العام غير موجودة بعد.</span> |
| `branding.refusals.request.invalid` | Check what you entered: the English name is needed, and each colour must read on white. | <span dir="rtl">تحقّق مما أدخلته: الاسم الإنجليزي مطلوب، ويجب أن يكون كل لون مقروءًا على الأبيض.</span> |
