/** Brief 14 C2 and D-067: one checklist item, and when it was ticked. */
export interface HandoverItem {
  id: string;
  nameEn: string;
  nameAr: string;
  tickedAt: string | null;
}

/** Brief 14 C2: a handover between two officers of a unit, for one role, with its checklist. */
export interface HandoverRecord {
  id: string;
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  roleId: string;
  roleNameEn: string;
  roleNameAr: string;
  outgoingPersonId: string;
  outgoingName: string;
  incomingPersonId: string;
  incomingName: string;
  outgoingConfirmedAt: string | null;
  incomingConfirmedAt: string | null;
  items: HandoverItem[];
}
