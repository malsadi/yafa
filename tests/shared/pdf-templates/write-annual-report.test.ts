import { describe, expect, it } from 'vitest';
import { annualReportDocument } from '../../../src/pdf-templates/annual-report/write-annual-report';
import type { AnnualReportContent } from '../../../src/shared/achievements-and-reports/annual-report';

const FIGURES = {
  startBalancePence: 10000,
  openingBalancesPence: 0,
  creditsPence: 2500,
  debitsPence: 1000,
  transfersInPence: 0,
  transfersOutPence: 0,
  endBalancePence: 11500,
};
const CONTENT: AnnualReportContent = {
  unitNameEn: 'North',
  unitNameAr: 'الشمال',
  year: 2025,
  periodStart: '2025-01-01',
  periodEnd: '2025-12-31',
  summary: null,
  achievements: [
    {
      title: 'Youth award',
      date: '2025-06-01',
      categoryNameEn: 'Youth',
      categoryNameAr: 'الشباب',
      officers: ['A', 'B'],
    },
  ],
  events: [],
  meetings: null,
  treasury: {
    start: '2025-01-01',
    end: '2025-12-31',
    closed: false,
    accounts: [],
    totals: FIGURES,
  },
  officers: [{ name: 'A', roleNameEn: 'Chair', roleNameAr: 'الرئيس' }],
};

describe('the annual report written out (brief 24 B2; P18; D-215)', () => {
  it('writes each section, says none or not in use, and marks open Treasury figures provisional', () => {
    const doc = annualReportDocument(CONTENT, {
      language: 'en',
      organisationName: 'Example Council',
    });
    const section = (heading: string) => doc.sections.find((s) => s.heading === heading)?.lines;
    expect(doc.title).toBe('Annual report 2025: North');
    expect(section('Achievements')).toEqual(['1 June 2025: Youth award (Youth). A, B']);
    expect(section('Events completed')).toEqual(['None.']);
    expect(section('Meetings held')).toEqual(['Meeting recorder is not in use in this unit.']);
    expect(section('Treasury')?.[0]).toBe('Provisional: the financial year is not yet closed.');
    expect(section('Treasury')).toContain('Balance at the end: £115.00');
    expect(section('Current officers')).toEqual(['A, Chair']);
  });

  it('is written in Arabic for an Arabic reader, with no provisional mark once the year is closed', () => {
    const closed = {
      ...CONTENT,
      treasury: CONTENT.treasury && { ...CONTENT.treasury, closed: true },
    };
    const doc = annualReportDocument(closed, { language: 'ar', organisationName: 'مجلس' });
    expect(doc.title).toBe('التقرير السنوي 2025: الشمال');
    expect(doc.sections.find((s) => s.heading === 'الخزينة')?.lines[0]).toContain('السنة المالية');
  });
});
