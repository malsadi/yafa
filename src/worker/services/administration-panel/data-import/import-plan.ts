import type { ImportReport } from '../../../../shared/administration-panel/data-import';

/** What an import will write, once nothing stops it (D-217, O-165). */
export interface ImportPlan {
  units: {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
    area: string | null;
    status: 'active' | 'inactive';
  }[];
  people: { id: string; email: string; name: string; phone: string }[];
  terms: {
    id: string;
    personId: string;
    roleId: string;
    unitId: string;
    startDate: string;
    endDate: string | null;
  }[];
  accounts: { id: string; unitId: string; name: string; branchType: string }[];
}

export const emptyReport = (): ImportReport => ({
  errors: [],
  units: { added: [], present: [] },
  people: { added: [], present: [] },
  terms: { added: 0, present: 0 },
  accounts: { added: [], present: [] },
});
