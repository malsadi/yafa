import type { SeedTexts } from '../../../scripts/seed/read-seed-files.ts';

// The fictional examples of docs/seed-files.md, as a set that passes every check.
export const VALID_SEED: SeedTexts = {
  units: [
    'type,code,name_en,name_ar,area,status',
    'national,GC,Example General Council,المجلس العام التجريبي,,active',
    'branch,NTH,Example North Branch,الفرع الشمالي التجريبي,Northtown,active',
    'branch,STH,Example South Branch,الفرع الجنوبي التجريبي,Southville,inactive',
  ].join('\n'),
  roles: [
    'name_en,name_ar,designation',
    'Chair,الرئيس,',
    'Secretary,أمين السر,',
    'Branch Register Officer,مسؤول سجل الفرع,Branch register officer',
    'National Register Officer,مسؤول السجل الوطني,National register officer',
  ].join('\n'),
  people: [
    'email,name,phone,system_administrator,role,unit_code,start_date,end_date',
    'ada.example@example.org,Ada Example,07700 900001,yes,Chair,GC,2026-01-15,',
    'sami.example@example.org,Sami Example,07700 900002,yes,National Register Officer,GC,2026-01-15,',
    'sami.example@example.org,Sami Example,07700 900002,yes,Secretary,NTH,2025-06-01,',
  ].join('\n'),
  noticeEn: 'Example notice.\n\nSecond paragraph.',
  noticeAr: 'إشعار تجريبي.',
};

export const TODAY = '2026-09-25';
