/** Brief 14 A1 and 25 B1: a unit — the General Council or a branch. */
export interface UnitRecord {
  id: string;
  type: 'national' | 'branch';
  code: string;
  nameEn: string;
  nameAr: string;
  area: string | null;
  status: 'active' | 'inactive';
}

/** What an officer enters for a branch; the General Council has no area or status. */
export interface UnitInput {
  code: string;
  nameEn: string;
  nameAr: string;
  area: string;
  status: 'active' | 'inactive';
}
