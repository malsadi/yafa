/** Brief 14 B1 and C3: one term of one officer, with the person's details. */
export interface OfficerRecord {
  termId: string;
  personId: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleNameEn: string;
  roleNameAr: string;
  startDate: string;
  endDate: string | null;
}

/**
 * Brief 14 B3: a current officer, with whether their term ends within the
 * ending-soon window — null while that window is not set (T-100).
 */
export interface CurrentOfficerRecord extends OfficerRecord {
  endingSoon: boolean | null;
}
