/** Brief 20 A3 and D-157: a national circular as a receiving branch sees it. */
export interface ReceivedCircular {
  id: string;
  title: string;
  sentAt: string;
  /** P14: when any officer of the branch first opened it; null if nobody has. */
  openedAt: string | null;
}

/** An opened circular, in full. */
export interface OpenedCircular extends ReceivedCircular {
  body: string;
}

/** Brief 20 A3, A4 and D-157: a circular the General Council sent, with which branches have opened it. */
export interface SentCircular {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  sentByName: string;
  toAllBranches: boolean;
  recipients: { unitId: string; nameEn: string; nameAr: string; openedAt: string | null }[];
}

/** The branches a circular can be sent to. */
export interface CircularBranch {
  id: string;
  nameEn: string;
  nameAr: string;
}
