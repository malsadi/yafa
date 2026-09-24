# Phase 1 report: Committee register and Administration access and organisation (DRAFT, in progress)

**Status:** started 2026-09-24 (D-041). Brief section 26, Phase 1:
- **Register:** units, people, terms, roles, role designations, elections, handovers, past officers, invitations.
- **Administration panel:** system administrators, officer accounts, permissions matrix, access check, units, roles, lists, set-up checklist.
- **Also:** load the owner's seed files, and deliver `docs/permissions.md`.

## Progress summary (public)

Copied to the public progress page by `npm run progress-page` (D-040, D-056). Public wording: neutral third person, plain words, build progress only.

<!-- progress:start -->
Status: In progress
Summary: The register at the heart of the portal: branches, roles, terms of office, elections and handovers, with the first set-up screens. || السجلّ الذي تقوم عليه البوابة: الفروع والأدوار وفترات العضوية والانتخابات وعمليات التسليم، مع أولى شاشات الإعداد.
Started: 2026-09-24
Last updated: 2026-09-24

Built:
- The format for the launch information || صيغة بيانات الإطلاق
- Roles named in both English and Arabic || تسمية الأدوار بالإنجليزية والعربية
- Groundwork for the set-up screens || الأساس لشاشات الإعداد
- Choosing who looks after the portal's set-up, with at least two people always in place || اختيار من يتولّى إعداد البوابة، مع وجود شخصين على الأقل دائمًا
- The first set-up screen, in English and Arabic, with every change kept and reversible || أولى شاشات الإعداد بالعربية والإنجليزية، مع حفظ كل تغيير وإمكانية التراجع عنه
- Adding and changing branches, each named in English and Arabic || إضافة الفروع وتعديلها، مع تسمية كل منها بالعربية والإنجليزية
- Standard roles, and a branch's own extra roles when allowed || الأدوار القياسية، والأدوار الإضافية الخاصة بكل فرع عند السماح بها
- Marking the two register roles || تحديد دوري مسؤولي السجل
- Adding committee members with their terms, and keeping past terms as history || إضافة أعضاء اللجان وفترات عضويتهم، والاحتفاظ بالفترات السابقة سجلًّا
- Invitations to join the portal, and each account's state || الدعوات للانضمام إلى البوابة، وحالة كل حساب
- Locking and unlocking accounts, and signing out everywhere || قفل الحسابات وفتحها، وتسجيل الخروج من كل الأجهزة
- Locking an account on the day its last term ends || قفل الحساب في يوم انتهاء آخر فترة عضوية
- The lists that set-up screens choose from, and the fixed archive categories || القوائم التي تختار منها شاشات الإعداد، وتصنيفات الأرشيف الثابتة

Left:
- Elections and handovers || الانتخابات وعمليات التسليم
- More set-up screens, and a set-up checklist || مزيد من شاشات الإعداد، وقائمة للإعداد
- Loading the launch information || تحميل بيانات الإطلاق

Pending:
- The launch information, to be supplied before it is loaded || بيانات الإطلاق، على أن تُقدَّم قبل تحميلها
- A decision on whether list items can be removed || قرار بشأن إمكانية حذف عناصر القوائم {O-026}
- A decision on how list items are ordered || قرار بشأن ترتيب عناصر القوائم {O-027}
<!-- progress:end -->

## Before starting (CLAUDE.md, "How every session works", step 3)

- **P-items:** P1, P3, P4, P5, P21 and P22, all confirmed (D-042).
- **Owner inputs:** the seed files in `seed/`, specified field by field in `docs/seed-files.md`. The owner will supply them before they're needed. Loading them is the last Phase 1 step.
- **Open for this phase:** none. O-021 to O-024 were answered 2026-09-24 (D-052 to D-055), and D-046 settled how administrators get their powers.
